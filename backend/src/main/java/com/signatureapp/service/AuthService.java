package com.signatureapp.service;

import com.signatureapp.dto.AuthResponse;
import com.signatureapp.dto.LoginRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);
}
