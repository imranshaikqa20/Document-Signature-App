package com.signatureapp.service;

import com.signatureapp.dto.AuditResponse;
import com.signatureapp.model.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service responsible for:
 *  - Logging audit events
 *  - Fetching audit history (paginated)
 */
public interface AuditService {

    /* =========================================================
       LOG ACTION
    ========================================================= */

    /**
     * Log an audit event for a document.
     *
     * @param documentId  ID of the document
     * @param action      AuditAction enum value
     * @param performedBy User email
     * @param ipAddress   Request IP address or "SYSTEM"
     */
    void log(Long documentId,
             AuditAction action,
             String performedBy,
             String ipAddress);


    /* =========================================================
       FETCH AUDIT HISTORY (PAGINATED)
    ========================================================= */

    /**
     * Retrieve paginated audit history for a document.
     *
     * @param documentId Document ID
     * @param pageable   Pagination + sorting configuration
     * @return Page of AuditResponse DTO
     */
    Page<AuditResponse> getAuditHistory(Long documentId, Pageable pageable);
}