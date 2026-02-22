package com.signatureapp.model;


public enum AuditAction {

    /* =========================
       LEGACY VALUES (Already in DB)
       DO NOT REMOVE unless DB cleaned
    ========================= */
    UPLOAD,
    DOWNLOAD,
    SIGN,
    DELETE,

    /* =========================
       CURRENT STANDARD VALUES
    ========================= */
    DOCUMENT_UPLOADED,
    DOCUMENT_VIEWED,
    DOCUMENT_SIGNED,
    DOCUMENT_DOWNLOADED,
    DOCUMENT_DELETED,
    DOCUMENT_SHARED,
    DOCUMENT_UPDATED
}