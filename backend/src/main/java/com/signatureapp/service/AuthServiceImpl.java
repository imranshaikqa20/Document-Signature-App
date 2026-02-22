package com.signatureapp.service;

import com.signatureapp.dto.AuthResponse;
import com.signatureapp.dto.LoginRequest;
import com.signatureapp.model.User;
import com.signatureapp.repository.UserRepository;
import com.signatureapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new RuntimeException("Email and password are required");
        }

        // 🔥 Normalize email BEFORE DB lookup
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 🔥 CRITICAL: Always generate token using DB email
        String token = jwtUtil.generateToken(user.getEmail().trim().toLowerCase());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .build();
    }
}