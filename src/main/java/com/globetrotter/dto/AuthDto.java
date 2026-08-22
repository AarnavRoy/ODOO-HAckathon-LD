package com.globetrotter.dto;

public class AuthDto {

    public record SignupRequest(String name, String email, String password) {}
    
    public record LoginRequest(String email, String password) {}
    
    public record ForgotPasswordRequest(String email) {}
    
    public record MessageResponse(String message) {}
    
    public record AuthResponse(String token, com.globetrotter.model.User user) {}
}
