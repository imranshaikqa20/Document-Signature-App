package com.signatureapp.controller;

import com.signatureapp.dto.AuditResponse;
import com.signatureapp.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditService auditService;

    /* =========================================================
       GET AUDIT HISTORY (WITH PAGINATION)
    ========================================================= */
    @GetMapping("/{documentId}")
    public Page<AuditResponse> getAuditHistory(
            @PathVariable Long documentId,
            Pageable pageable) {

        return auditService.getAuditHistory(documentId, pageable);
    }
}