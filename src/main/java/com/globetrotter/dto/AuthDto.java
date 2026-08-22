package com.globetrotter.dto;

import com.globetrotter.model.User;

public class AuthDto {

    public record SignupRequest(String name, String username, String email, String password) {
        public SignupRequest(String name, String email, String password) {
            this(name, null, email, password);
        }
    }
    
    public record LoginRequest(String username, String email, String password) {
        public LoginRequest(String username, String password) {
            this(username, null, password);
        }
    }
    
    public record ForgotPasswordVerifyRequest(String email, String name) {}

    public record ForgotPasswordResetRequest(String email, String name, String newPassword) {}
    
    public record MessageResponse(String message) {}
    
    public record AuthResponse(String token, User user) {}

    public record CheckUsernameResponse(boolean available, String message) {}

    public record EmailVerifyResponse(boolean valid, String message) {}
}
