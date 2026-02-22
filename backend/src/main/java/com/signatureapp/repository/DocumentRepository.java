package com.signatureapp.repository;

import com.signatureapp.model.Document;
import com.signatureapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    /* =========================================================
       FETCH DOCUMENTS BY OWNER (Uploader Only)
    ========================================================= */
    List<Document> findByUploadedByOrderByUploadedAtDesc(User user);


    /* =========================================================
       FETCH DOCUMENTS FOR USER
       (Uploader OR Assigned Signer)
    ========================================================= */
    @Query("""
        SELECT DISTINCT d
        FROM Document d
        LEFT JOIN d.signers s
        WHERE LOWER(d.uploadedBy.email) = LOWER(:email)
           OR LOWER(s.signerEmail) = LOWER(:email)
        ORDER BY d.uploadedAt DESC
    """)
    List<Document> findDocumentsForUser(@Param("email") String email);


    /* =========================================================
       SECURITY: FETCH DOCUMENT BY ID + OWNER
    ========================================================= */
    Optional<Document> findByIdAndUploadedBy(Long id, User user);


    /* =========================================================
       SAFE DELETE BY OWNER
    ========================================================= */
    void deleteByIdAndUploadedBy(Long id, User user);


    /* =========================================================
       CHECK OWNERSHIP
    ========================================================= */
    boolean existsByIdAndUploadedBy(Long id, User user);
}