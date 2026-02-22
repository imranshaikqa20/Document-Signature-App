package com.signatureapp.model;

public enum SignerStatus {

    PENDING,   // Current active signer (allowed to sign)
    WAITING,   // Waiting for previous signer to complete
    SIGNED     // Signer has completed signing

}