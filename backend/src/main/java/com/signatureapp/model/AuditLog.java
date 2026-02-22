package com.signatureapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing audit logs for document actions.
 * Stores who performed what action and when.
 */
@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_document", columnList = "document_id"),
                @Index(name = "idx_audit_performed_at", columnList = "performed_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    /* =========================================================
       PRIMARY KEY
    ========================================================= */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================================================
       RELATION WITH DOCUMENT
       IMPORTANT:
       - NO cascade here
       - Parent (Document) controls lifecycle
    ========================================================= */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "document_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_audit_document")
    )
    @JsonIgnore   // Prevent infinite recursion
    private Document document;

    /* =========================================================
       ACTION DETAILS
    ========================================================= */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AuditAction action;

    @Column(nullable = false, length = 150)
    private String performedBy;

    @Column(nullable = false, length = 100)
    private String ipAddress;

    /* =========================================================
       TIMESTAMP
    ========================================================= */
    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    /* =========================================================
       AUTO SET TIMESTAMP
    ========================================================= */
    @PrePersist
    protected void onCreate() {
        if (this.performedAt == null) {
            this.performedAt = LocalDateTime.now();
        }
    }
}