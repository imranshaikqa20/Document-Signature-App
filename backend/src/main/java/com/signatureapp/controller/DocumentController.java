package com.signatureapp.controller;

import com.signatureapp.dto.CreateDocumentRequest;
import com.signatureapp.dto.DocumentResponse;
import com.signatureapp.dto.SignRequest;
import com.signatureapp.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /* =========================================================
       GET AUTHENTICATED USER EMAIL
    ========================================================= */
    private String getUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    /* =========================================================
       UPLOAD DOCUMENT (MULTI-SIGNER SUPPORT)
    ========================================================= */
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid CreateDocumentRequest request
    ) {

        documentService.uploadDocument(
                file,
                request.getSignerEmails(),
                getUserEmail()
        );

        return ResponseEntity.ok(
                Map.of("message", "Document uploaded successfully")
        );
    }

    /* =========================================================
       LIST USER DOCUMENTS
    ========================================================= */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getMyDocuments() {

        return ResponseEntity.ok(
                documentService.getUserDocuments(getUserEmail())
        );
    }

    /* =========================================================
       VIEW DOCUMENT (NO DOWNLOAD TRACKING)
    ========================================================= */
    @GetMapping("/{id}/view")
    public ResponseEntity<byte[]> viewDocument(
            @PathVariable Long id
    ) {

        byte[] fileBytes =
                documentService.getDocumentBytes(id, getUserEmail());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"document.pdf\"")
                .header(HttpHeaders.CACHE_CONTROL,
                        "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(fileBytes);
    }

    /* =========================================================
       DOWNLOAD DOCUMENT (TRACKED)
    ========================================================= */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long id
    ) {

        byte[] fileBytes =
                documentService.downloadDocument(id, getUserEmail());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"document.pdf\"")
                .body(fileBytes);
    }

    /* =========================================================
       SIGN DOCUMENT
    ========================================================= */
    @PostMapping(
            value = "/{id}/sign",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> signDocument(
            @PathVariable Long id,
            @RequestBody SignRequest request
    ) {

        documentService.signDocument(id, request, getUserEmail());

        return ResponseEntity.ok(
                Map.of("message", "Document signed successfully")
        );
    }

    /* =========================================================
       DELETE DOCUMENT
    ========================================================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id
    ) {

        documentService.deleteDocument(id, getUserEmail());

        return ResponseEntity.ok(
                Map.of("message", "Document deleted successfully")
        );
    }
}