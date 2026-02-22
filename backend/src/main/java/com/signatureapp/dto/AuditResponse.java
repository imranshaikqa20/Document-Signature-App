package com.signatureapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditResponse {

    private String action;
    private String performedBy;
    private String ipAddress;
    private LocalDateTime performedAt;
}