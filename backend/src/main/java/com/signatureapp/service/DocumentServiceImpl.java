package com.signatureapp.service;

import com.signatureapp.dto.DocumentResponse;
import com.signatureapp.dto.SignRequest;
import com.signatureapp.model.*;
import com.signatureapp.repository.DocumentRepository;
import com.signatureapp.repository.DocumentSignerRepository;
import com.signatureapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentSignerRepository documentSignerRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    private static final String UPLOAD_DIR =
            System.getProperty("user.home") + File.separator + "signature-app-uploads";

    /* =========================================================
       UTILITY METHODS
    ========================================================= */

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String getLoggedInUserEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("User not authenticated");
        }

        return normalize(authentication.getName());
    }

    private Document getDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    /* =========================================================
       UPLOAD DOCUMENT
    ========================================================= */

    @Override
    @Transactional
    public void uploadDocument(
            MultipartFile file,
            List<String> signerEmails,
            String ignored
    ) {

        String userEmail = getLoggedInUserEmail();

        User uploader = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String storedFileName =
                    System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path filePath = Paths.get(UPLOAD_DIR, storedFileName);
            file.transferTo(filePath.toFile());

            Document document = Document.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .filePath(filePath.toString())
                    .status(DocumentStatus.PENDING)
                    .uploadedBy(uploader)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            documentRepository.save(document);

            for (int i = 0; i < signerEmails.size(); i++) {

                String signerEmail = normalize(signerEmails.get(i));

                DocumentSigner signer = DocumentSigner.builder()
                        .document(document)
                        .signerEmail(signerEmail)
                        .signingOrder(i + 1)
                        .status(i == 0 ? SignerStatus.PENDING : SignerStatus.WAITING)
                        .build();

                documentSignerRepository.save(signer);
            }

            auditService.log(document.getId(),
                    AuditAction.DOCUMENT_UPLOADED,
                    userEmail,
                    "SYSTEM");

        } catch (Exception e) {
            throw new RuntimeException("Upload failed", e);
        }
    }

    /* =========================================================
       LIST DOCUMENTS
    ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(String ignored) {

        String userEmail = getLoggedInUserEmail();

        return documentRepository
                .findDocumentsForUser(userEmail)
                .stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .fileName(doc.getFileName())
                        .status(doc.getStatus().name())
                        .uploadedAt(doc.getUploadedAt())
                        .build())
                .toList();
    }

    /* =========================================================
       VIEW DOCUMENT
    ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public byte[] getDocumentBytes(Long documentId, String ignored) {
        try {
            return Files.readAllBytes(
                    Paths.get(getDocument(documentId).getFilePath()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to read document", e);
        }
    }

    /* =========================================================
       DOWNLOAD DOCUMENT
    ========================================================= */

    @Override
    @Transactional
    public byte[] downloadDocument(Long documentId, String ignored) {

        String userEmail = getLoggedInUserEmail();

        try {
            byte[] bytes = Files.readAllBytes(
                    Paths.get(getDocument(documentId).getFilePath()));

            auditService.log(documentId,
                    AuditAction.DOCUMENT_DOWNLOADED,
                    userEmail,
                    "SYSTEM");

            return bytes;

        } catch (Exception e) {
            throw new RuntimeException("Download failed", e);
        }
    }

    /* =========================================================
       SIGN DOCUMENT
    ========================================================= */

    @Override
    @Transactional
    public void signDocument(
            Long documentId,
            SignRequest request,
            String ignored
    ) {

        String userEmail = getLoggedInUserEmail();

        Document document = getDocument(documentId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentSigner signer = documentSignerRepository
                .findSigner(documentId, userEmail)
                .orElseThrow(() ->
                        new RuntimeException("You are not an assigned signer for this document"));

        if (signer.getStatus() == SignerStatus.SIGNED)
            throw new RuntimeException("You already signed this document");

        if (signer.getStatus() != SignerStatus.PENDING)
            throw new RuntimeException("Please wait for your turn to sign");

        try (PDDocument pdf = PDDocument.load(new File(document.getFilePath()))) {

            PDPage page = pdf.getPage(request.getPage() - 1);
            PDRectangle box = page.getMediaBox();

            float pageWidth = box.getWidth();
            float pageHeight = box.getHeight();

            String base64 = request.getSignatureImage().split(",")[1];
            byte[] imageBytes = Base64.getDecoder().decode(base64);

            PDImageXObject image =
                    PDImageXObject.createFromByteArray(pdf, imageBytes, "signature");

            // ✅ ONLY CHANGE: signature size reduced
            float imageWidth = (float) (request.getWidthPercent() * pageWidth * 0.65f);
            float imageHeight = (float) (request.getHeightPercent() * pageHeight * 0.65f);

            float x = (float) (request.getXPercent() * pageWidth);
            float y = (float) (pageHeight - (request.getYPercent() * pageHeight) - imageHeight);

            try (PDPageContentStream stream =
                         new PDPageContentStream(pdf, page,
                                 PDPageContentStream.AppendMode.APPEND, true, true)) {
                stream.drawImage(image, x, y, imageWidth, imageHeight);
            }

            pdf.save(document.getFilePath());

        } catch (Exception e) {
            throw new RuntimeException("Signing failed", e);
        }

        signer.setStatus(SignerStatus.SIGNED);
        signer.setSignedAt(LocalDateTime.now());
        documentSignerRepository.save(signer);

        documentSignerRepository
                .findFirstByDocument_IdAndStatusOrderBySigningOrderAsc(
                        documentId, SignerStatus.WAITING)
                .ifPresent(next -> {
                    next.setStatus(SignerStatus.PENDING);
                    documentSignerRepository.save(next);
                });

        if (!documentSignerRepository.existsByDocument_IdAndStatus(
                documentId, SignerStatus.PENDING)) {

            document.setStatus(DocumentStatus.SIGNED);
            document.setSignedAt(LocalDateTime.now());
            document.setSignedBy(user);
            documentRepository.save(document);
        }

        auditService.log(documentId,
                AuditAction.DOCUMENT_SIGNED,
                userEmail,
                "SYSTEM");
    }

    /* =========================================================
       DELETE DOCUMENT
    ========================================================= */

    @Override
    @Transactional
    public void deleteDocument(Long documentId, String ignored) {

        String userEmail = getLoggedInUserEmail();

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository
                .findByIdAndUploadedBy(documentId, user)
                .orElseThrow(() -> new RuntimeException("Not authorized"));

        auditService.log(documentId,
                AuditAction.DOCUMENT_DELETED,
                userEmail,
                "SYSTEM");

        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            documentRepository.delete(document);
        } catch (Exception e) {
            throw new RuntimeException("Delete failed", e);
        }
    }
}