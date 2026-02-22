package com.signatureapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * Request DTO used when creating/uploading a document
 * with multiple signers.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDocumentRequest {

    /* =========================================================
       SIGNER EMAIL LIST
    ========================================================= */

    @NotEmpty(message = "At least one signer is required")
    @Size(min = 1, message = "Document must have at least one signer")
    private List<
            @Email(message = "Invalid email format")
                    String
            > signerEmails;

}