package com.signatureapp.repository;

import com.signatureapp.model.DocumentSigner;
import com.signatureapp.model.SignerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentSignerRepository extends JpaRepository<DocumentSigner, Long> {

    /* =========================================================
       GET ALL SIGNERS FOR A DOCUMENT (ORDERED)
    ========================================================= */
    List<DocumentSigner> findByDocument_IdOrderBySigningOrderAsc(Long documentId);


    /* =========================================================
       SAFE FIND SIGNER BY DOCUMENT + EMAIL
       (TRIM + LOWER to avoid whitespace/case issues)
    ========================================================= */
    @Query("""
        SELECT ds FROM DocumentSigner ds
        WHERE ds.document.id = :docId
        AND LOWER(TRIM(ds.signerEmail)) = LOWER(TRIM(:email))
    """)
    Optional<DocumentSigner> findSigner(
            @Param("docId") Long documentId,
            @Param("email") String email
    );


    /* =========================================================
       FALLBACK METHOD (Optional Safety)
       Simple IgnoreCase finder
    ========================================================= */
    Optional<DocumentSigner> findByDocument_IdAndSignerEmailIgnoreCase(
            Long documentId,
            String signerEmail
    );


    /* =========================================================
       GET FIRST SIGNER BY STATUS (ORDER ENFORCEMENT)
    ========================================================= */
    Optional<DocumentSigner> findFirstByDocument_IdAndStatusOrderBySigningOrderAsc(
            Long documentId,
            SignerStatus status
    );


    /* =========================================================
       COUNT SIGNERS BY STATUS
    ========================================================= */
    long countByDocument_IdAndStatus(
            Long documentId,
            SignerStatus status
    );


    /* =========================================================
       CHECK IF ANY SIGNER EXISTS WITH STATUS
    ========================================================= */
    boolean existsByDocument_IdAndStatus(
            Long documentId,
            SignerStatus status
    );
}