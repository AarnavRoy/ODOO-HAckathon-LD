package com.globetrotter.controller;

import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String UPLOAD_DIR = "./uploads/profile-photos";

    @Autowired
    private UserRepository userRepository;

    public record UpdateUserRequest(String name, String profilePhotoUrl, String languagePreference) {}
    public record MessageResponse(String message) {}

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        // Validate empty file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No file provided"));
        }

        // Validate content type — strictly images only
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Only image files are allowed (JPEG, PNG, GIF, WebP)")
            );
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Image must be smaller than 5MB")
            );
        }

        User user = getCurrentUser();

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename: userId_timestamp.extension
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                // Derive extension from content type
                extension = switch (contentType) {
                    case "image/jpeg" -> ".jpg";
                    case "image/png" -> ".png";
                    case "image/gif" -> ".gif";
                    case "image/webp" -> ".webp";
                    default -> ".jpg";
                };
            }

            String filename = user.getId() + "_" + System.currentTimeMillis() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save the file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user's profile photo URL to the served path
            String photoUrl = "/api/uploads/profile-photos/" + filename;
            user.setProfilePhotoUrl(photoUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("profilePhotoUrl", photoUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                new MessageResponse("Failed to upload file: " + e.getMessage())
            );
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UpdateUserRequest request) {
        User user = getCurrentUser();
        if (request.name() != null) user.setName(request.name());
        if (request.profilePhotoUrl() != null) user.setProfilePhotoUrl(request.profilePhotoUrl());
        if (request.languagePreference() != null) user.setLanguagePreference(request.languagePreference());
        
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMe() {
        User user = getCurrentUser();
        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
