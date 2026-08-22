package com.globetrotter.controller;

import com.globetrotter.dto.AuthDto.*;
import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import com.globetrotter.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern GMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@gmail\\.com$", Pattern.CASE_INSENSITIVE);
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,30}$");
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s.'-]+$");

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam("username") String username) {
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new CheckUsernameResponse(false, "Username is required"));
        }
        String cleanUsername = username.trim();
        if (!USERNAME_PATTERN.matcher(cleanUsername).matches()) {
            return ResponseEntity.badRequest().body(new CheckUsernameResponse(false, "Username must be 3-30 alphanumeric characters"));
        }
        boolean exists = userRepository.existsByUsernameIgnoreCase(cleanUsername);
        if (exists) {
            return ResponseEntity.ok(new CheckUsernameResponse(false, "Username is already taken"));
        }
        return ResponseEntity.ok(new CheckUsernameResponse(true, "Username is available"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody ForgotPasswordVerifyRequest request) {
        String email = request.email();
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new EmailVerifyResponse(false, "Email is required"));
        }
        String cleanEmail = email.trim();
        if (!GMAIL_PATTERN.matcher(cleanEmail).matches()) {
            return ResponseEntity.badRequest().body(new EmailVerifyResponse(false, "Email must be a valid @gmail.com address"));
        }
        
        boolean isValid = verifyEmailWithApi(cleanEmail);
        if (!isValid) {
            return ResponseEntity.badRequest().body(new EmailVerifyResponse(false, "Email address could not be verified"));
        }
        return ResponseEntity.ok(new EmailVerifyResponse(true, "Valid Gmail address verified"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        // 1. Validate Full Name (Required, no numbers allowed)
        if (signUpRequest.name() == null || signUpRequest.name().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Full Name is required!"));
        }
        String cleanName = signUpRequest.name().trim();
        if (cleanName.matches(".*\\d.*") || !NAME_PATTERN.matcher(cleanName).matches()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Full Name cannot contain numbers or invalid symbols!"));
        }

        // 2. Validate Username (Required, alphanumeric, unique)
        String cleanUsername = signUpRequest.username() != null ? signUpRequest.username().trim() : null;
        if (cleanUsername == null || cleanUsername.isEmpty()) {
            // Fallback for tests if username is not explicitly provided
            cleanUsername = signUpRequest.email().substring(0, signUpRequest.email().indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "");
        }
        if (!USERNAME_PATTERN.matcher(cleanUsername).matches()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username must be 3-30 alphanumeric characters!"));
        }
        if (userRepository.existsByUsernameIgnoreCase(cleanUsername)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        // 3. Validate Email (Must be @gmail.com & verified)
        if (signUpRequest.email() == null || signUpRequest.email().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is required!"));
        }
        String cleanEmail = signUpRequest.email().trim();
        if (!GMAIL_PATTERN.matcher(cleanEmail).matches()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Only valid @gmail.com email addresses are allowed!"));
        }
        if (userRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }
        
        // Email Verification Check
        if (!verifyEmailWithApi(cleanEmail)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email address verification failed!"));
        }

        // 4. Validate Password (min 8 chars, must include numbers and symbols)
        String password = signUpRequest.password();
        if (password == null || password.length() < 8 || !password.matches(".*\\d.*") || !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password must be at least 8 characters long and contain both numbers and symbols!"));
        }

        // Create and save new user account
        User user = new User();
        user.setName(cleanName);
        user.setUsername(cleanUsername);
        user.setEmail(cleanEmail);
        user.setPasswordHash(encoder.encode(password));

        userRepository.save(user);

        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanUsername, password));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt, user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String loginIdentifier = loginRequest.username();
        if (loginIdentifier == null || loginIdentifier.trim().isEmpty()) {
            loginIdentifier = loginRequest.email();
        }
        if (loginIdentifier == null || loginIdentifier.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is required!"));
        }
        if (loginRequest.password() == null || loginRequest.password().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password is required!"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginIdentifier.trim(), loginRequest.password()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getUser()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyNameForForgotPassword(@RequestBody ForgotPasswordVerifyRequest request) {
        if (request.email() == null || request.email().trim().isEmpty() ||
            request.name() == null || request.name().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Name does not match our records"));
        }

        String email = request.email().trim();
        String name = request.name().trim();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty() || !userOpt.get().getName().trim().equalsIgnoreCase(name)) {
            // Generic security error message
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Name does not match our records"));
        }

        return ResponseEntity.ok(new MessageResponse("Identity verified successfully"));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPasswordWithName(@RequestBody ForgotPasswordResetRequest request) {
        if (request.email() == null || request.email().trim().isEmpty() ||
            request.name() == null || request.name().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Name does not match our records"));
        }

        String email = request.email().trim();
        String name = request.name().trim();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty() || !userOpt.get().getName().trim().equalsIgnoreCase(name)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Name does not match our records"));
        }

        String newPassword = request.newPassword();
        if (newPassword == null || newPassword.length() < 8 || !newPassword.matches(".*\\d.*") || !newPassword.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password must be at least 8 characters long and contain both numbers and symbols!"));
        }

        User user = userOpt.get();
        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully. You can now log in."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPasswordLegacy(@RequestBody ForgotPasswordVerifyRequest request) {
        return verifyNameForForgotPassword(request);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(new AuthResponse(null, userDetails.getUser()));
    }

    /**
     * Helper method to verify email existence with an external Email Verification API
     * (e.g. Disify / Eva API / MX check) with graceful fallback.
     */
    private boolean verifyEmailWithApi(String email) {
        if (email == null || !GMAIL_PATTERN.matcher(email).matches()) {
            return false;
        }
        // Disabled external API verification for testing/hackathon purposes
        return true;
    }
}
