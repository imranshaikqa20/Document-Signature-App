package com.signatureapp.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpUtils {

    private IpUtils() {
        // prevent instantiation
    }

    public static String getClientIp(HttpServletRequest request) {

        String ipAddress = request.getHeader("X-Forwarded-For");

        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }

        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }

        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }

        // If multiple IPs exist (behind proxy), take first one
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        return ipAddress;
    }
}