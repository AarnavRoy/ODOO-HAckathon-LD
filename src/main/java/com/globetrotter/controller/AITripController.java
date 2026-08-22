package com.globetrotter.controller;

import com.globetrotter.dto.AITripDto.*;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import com.globetrotter.service.ai.AITripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AITripController {

    @Autowired
    private AITripService aiTripService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/generate-trip")
    public ResponseEntity<?> generateTrip(@RequestBody AITripRequestDto request) {
        try {
            AITripResponseDto response = aiTripService.generateTrip(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("[AITripController] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "We couldn't generate a valid itinerary. Please try again."));
        }
    }

    @PostMapping("/refine-trip")
    public ResponseEntity<?> refineTrip(@RequestBody AIRefineRequestDto request) {
        try {
            AITripResponseDto response = aiTripService.refineTrip(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("[AITripController] Refinement Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Could not refine itinerary. Please try again."));
        }
    }

    @PostMapping("/save-trip")
    public ResponseEntity<?> saveTrip(@RequestBody AITripResponseDto aiTrip) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Authentication required to save trip."));
        }

        try {
            Trip savedTrip = aiTripService.saveAITrip(aiTrip, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
        } catch (Exception e) {
            System.err.println("[AITripController] Save Trip Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to save AI trip: " + e.getMessage()));
        }
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        if (auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser();
        }

        if (auth.getName() != null) {
            Optional<User> opt = userRepository.findByUsernameIgnoreCase(auth.getName());
            if (opt.isPresent()) return opt.get();
            return userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        }

        return null;
    }
}
