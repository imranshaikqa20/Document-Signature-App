package com.signatureapp.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentResponse {

    private Long id;
    private String fileName;
    private String status;
    private LocalDateTime uploadedAt;
}
