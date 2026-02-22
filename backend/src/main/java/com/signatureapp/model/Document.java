package com.signatureapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    /* =========================================================
       PRIMARY KEY
    ========================================================= */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================================================
       FILE DETAILS
    ========================================================= */
    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String filePath;

    /* =========================================================
       DOCUMENT STATUS (PENDING / SIGNED)
    ========================================================= */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.PENDING;

    /* =========================================================
       TIMESTAMPS
    ========================================================= */
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column
    private LocalDateTime signedAt;

    /* =========================================================
       RELATIONSHIPS
    ========================================================= */

    /**
     * User who uploaded the document
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    /**
     * Final signer (last signer who completed workflow)
     * This keeps backward compatibility with your previous logic.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signed_by")
    private User signedBy;

    /**
     * 🔥 MULTI-SIGNER WORKFLOW
     * One document → multiple ordered signers
     */
    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("signingOrder ASC")
    private List<DocumentSigner> signers;

    /**
     * 🔥 CASCADE DELETE AUDIT LOGS
     * When document is deleted,
     * related audit logs are deleted automatically.
     */
    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<AuditLog> auditLogs;

    /* =========================================================
       AUTO SET UPLOAD TIME
    ========================================================= */
    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = DocumentStatus.PENDING;
        }
    }
}