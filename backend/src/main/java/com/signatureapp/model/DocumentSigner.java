package com.signatureapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "document_signers",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"document_id", "signer_email"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSigner {

    /* =========================================================
       PRIMARY KEY
    ========================================================= */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================================================
       RELATIONSHIP WITH DOCUMENT
    ========================================================= */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    /* =========================================================
       SIGNER DETAILS
    ========================================================= */
    @Column(name = "signer_email", nullable = false)
    private String signerEmail;

    @Column(name = "signing_order", nullable = false)
    private int signingOrder;

    /* =========================================================
       SIGNER STATUS
    ========================================================= */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignerStatus status;

    /* =========================================================
       SIGNING METADATA
    ========================================================= */
    private LocalDateTime signedAt;

}