package com.globetrotter.controller;

import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    public record UpdateUserRequest(String name, String profilePhotoUrl, String languagePreference) {}
    public record MessageResponse(String message) {}

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
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
