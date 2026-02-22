package com.signatureapp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

    private final Key key;

    public JwtUtil(@Value("${jwt.secret}") String secret) {

        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least 32 characters long"
            );
        }

        this.key = Keys.hmacShaKeyFor(
                secret.trim().getBytes(StandardCharsets.UTF_8)
        );
    }

    /* =========================================================
       GENERATE TOKEN (EMAIL AS SUBJECT)
    ========================================================= */
    public String generateToken(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        String normalizedEmail = email.trim().toLowerCase();

        return Jwts.builder()
                .setSubject(normalizedEmail)   // 🔥 MUST BE EMAIL
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* =========================================================
       EXTRACT EMAIL
    ========================================================= */
    public String extractEmail(String token) {

        Claims claims = extractAllClaims(token);
        String subject = claims.getSubject();

        return subject == null ? null : subject.trim().toLowerCase();
    }

    /* =========================================================
       VALIDATE TOKEN
    ========================================================= */
    public boolean isTokenValid(String token) {

        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            Claims claims = extractAllClaims(token.trim());
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid JWT: " + e.getMessage());
            return false;
        }
    }

    /* =========================================================
       CHECK EXPIRATION
    ========================================================= */
    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    /* =========================================================
       PARSE CLAIMS
    ========================================================= */
    private Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token.trim())
                .getBody();
    }
}