package com.signatureapp.repository;

import com.signatureapp.model.AuditAction;
import com.signatureapp.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditRepository extends JpaRepository<AuditLog, Long> {

    /* =========================================================
       FETCH AUDIT LOGS BY DOCUMENT ID (PAGINATED)
       Ordered by latest first
    ========================================================= */
    Page<AuditLog> findByDocument_IdOrderByPerformedAtDesc(
            Long documentId,
            Pageable pageable
    );

    /* =========================================================
       CHECK IF DOWNLOAD ALREADY LOGGED RECENTLY
       (Prevents duplicate logs within time window)
    ========================================================= */
    boolean existsByDocument_IdAndActionAndPerformedByAndPerformedAtAfter(
            Long documentId,
            AuditAction action,
            String performedBy,
            LocalDateTime performedAt
    );
}