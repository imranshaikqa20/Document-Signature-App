package com.signatureapp.service;

import com.signatureapp.dto.AuditResponse;
import com.signatureapp.model.AuditAction;
import com.signatureapp.model.AuditLog;
import com.signatureapp.model.Document;
import com.signatureapp.repository.AuditRepository;
import com.signatureapp.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditRepository auditRepository;
    private final DocumentRepository documentRepository;

    /* =========================================================
       LOG ACTION (SAFE + DUPLICATE PROTECTION)
    ========================================================= */
    @Override
    @Transactional
    public void log(Long documentId,
                    AuditAction action,
                    String performedBy,
                    String ipAddress) {

        performedBy = performedBy.trim().toLowerCase();

        // 🔥 Fetch document safely
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // 🔥 Prevent duplicate DOWNLOAD logs within 5 seconds
        if (action == AuditAction.DOCUMENT_DOWNLOADED) {

            boolean recentlyLogged =
                    auditRepository.existsByDocument_IdAndActionAndPerformedByAndPerformedAtAfter(
                            documentId,
                            action,
                            performedBy,
                            LocalDateTime.now().minusSeconds(5)
                    );

            if (recentlyLogged) {
                return; // Skip duplicate log
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .document(document)
                .action(action)
                .performedBy(performedBy)
                .ipAddress(ipAddress)
                .performedAt(LocalDateTime.now())
                .build();

        auditRepository.save(auditLog);
    }

    /* =========================================================
       FETCH AUDIT HISTORY (PAGINATED)
    ========================================================= */
    @Override
    @Transactional(readOnly = true)
    public Page<AuditResponse> getAuditHistory(Long documentId, Pageable pageable) {

        documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return auditRepository
                .findByDocument_IdOrderByPerformedAtDesc(documentId, pageable)
                .map(log -> AuditResponse.builder()
                        .action(log.getAction().name())
                        .performedBy(log.getPerformedBy())
                        .ipAddress(log.getIpAddress())
                        .performedAt(log.getPerformedAt())
                        .build());
    }
}