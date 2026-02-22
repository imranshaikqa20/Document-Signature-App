package com.signatureapp.service;

import com.signatureapp.dto.DocumentResponse;
import com.signatureapp.dto.SignRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service layer responsible for:
 *  - Uploading PDF documents (multi-signer support)
 *  - Listing user documents
 *  - Viewing documents (no audit log)
 *  - Downloading documents (with audit log)
 *  - Signing documents (PDFBox integration + workflow enforcement)
 *  - Deleting documents
 *
 * NOTE:
 * Audit logging is handled inside the implementation layer.
 */
public interface DocumentService {

    /* =========================================================
       UPLOAD DOCUMENT (MULTI-SIGNER SUPPORT)
    ========================================================= */

    /**
     * Upload a new PDF document and assign multiple signers
     * in the provided order.
     *
     * @param file          PDF file to upload
     * @param signerEmails  Ordered list of signer emails
     * @param userEmail     Authenticated uploader email
     */
    void uploadDocument(
            MultipartFile file,
            List<String> signerEmails,
            String userEmail
    );


    /* =========================================================
       FETCH USER DOCUMENTS
    ========================================================= */

    /**
     * Retrieve all documents uploaded by the authenticated user.
     *
     * @param userEmail Authenticated user email
     * @return List of document summaries
     */
    List<DocumentResponse> getUserDocuments(String userEmail);


    /* =========================================================
       VIEW DOCUMENT (NO AUDIT LOG)
    ========================================================= */

    /**
     * Fetch document bytes for inline preview.
     * Does NOT create an audit log.
     *
     * @param documentId Document ID
     * @param userEmail  Authenticated user email
     * @return Raw PDF bytes
     */
    byte[] getDocumentBytes(Long documentId, String userEmail);


    /* =========================================================
       DOWNLOAD DOCUMENT (WITH AUDIT LOG)
    ========================================================= */

    /**
     * Download document file.
     * Creates DOCUMENT_DOWNLOADED audit entry.
     *
     * @param documentId Document ID
     * @param userEmail  Authenticated user email
     * @return Raw PDF bytes
     */
    byte[] downloadDocument(Long documentId, String userEmail);


    /* =========================================================
       SIGN DOCUMENT (MULTI-SIGNER WORKFLOW)
    ========================================================= */

    /**
     * Embed signature into PDF and enforce:
     *  - Only assigned signer can sign
     *  - Signing order enforcement
     *  - Next signer activation
     *  - Document marked SIGNED when all signers complete
     *
     * @param documentId Document ID
     * @param request    Signature request details
     * @param userEmail  Authenticated signer email
     */
    void signDocument(
            Long documentId,
            SignRequest request,
            String userEmail
    );


    /* =========================================================
       DELETE DOCUMENT
    ========================================================= */

    /**
     * Delete document belonging to authenticated user.
     *
     * @param documentId Document ID
     * @param userEmail  Authenticated user email
     */
    void deleteDocument(Long documentId, String userEmail);
}