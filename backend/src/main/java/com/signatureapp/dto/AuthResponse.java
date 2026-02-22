package com.signatureapp.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private String type;   // Bearer
}
