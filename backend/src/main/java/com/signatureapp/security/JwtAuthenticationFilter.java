package com.signatureapp.security;

import com.signatureapp.model.User;
import com.signatureapp.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;   // 🔥 IMPORTANT

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String authHeader = request.getHeader("Authorization");

            // No header or invalid format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7).trim();

            // Validate token
            if (!jwtUtil.isTokenValid(token)) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            // Extract email from JWT
            String email = jwtUtil.extractEmail(token);

            if (email == null) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            email = email.trim().toLowerCase();

            // 🔥 Load user from DB (guarantees real user)
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            // Only set authentication if not already set
            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getEmail(),     // principal
                                null,
                                Collections.singletonList(
                                        new SimpleGrantedAuthority("ROLE_USER")
                                )
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println("Authenticated user: " + user.getEmail());
            }

        } catch (Exception ex) {
            System.out.println("JWT Authentication Error: " + ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}