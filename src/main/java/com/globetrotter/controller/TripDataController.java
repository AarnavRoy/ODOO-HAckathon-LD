package com.globetrotter.controller;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import com.globetrotter.service.TripDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class TripDataController {

    @Autowired
    private TripDataService tripDataService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUserOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userRepository.findById(userDetails.getId()).orElse(null);
        }
        return null;
    }

    private User getCurrentUserRequired() {
        User user = getCurrentUserOptional();
        if (user == null) {
            throw new SecurityException("Unauthorized: Authentication required");
        }
        return user;
    }

    @GetMapping("/api/trips/{tripId}/itinerary")
    public ResponseEntity<?> getTripItinerary(@PathVariable Long tripId) {
        try {
            User currentUser = getCurrentUserOptional();
            ItineraryResponse response = tripDataService.getTripItinerary(tripId, currentUser);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/api/trips/{tripId}/budget")
    public ResponseEntity<?> getTripBudget(@PathVariable Long tripId) {
        try {
            User currentUser = getCurrentUserOptional();
            BudgetResponse response = tripDataService.getTripBudget(tripId, currentUser);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/api/trips/{tripId}/share")
    public ResponseEntity<?> shareTrip(@PathVariable Long tripId) {
        try {
            User currentUser = getCurrentUserRequired();
            ShareResponse response = tripDataService.shareTrip(tripId, currentUser);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/api/public/trips/{shareToken}")
    public ResponseEntity<?> getSharedTrip(@PathVariable String shareToken) {
        try {
            TripDetailResponse response = tripDataService.getSharedTrip(shareToken);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/api/public/trips/{shareToken}/copy")
    public ResponseEntity<?> copySharedTrip(@PathVariable String shareToken) {
        try {
            User currentUser = getCurrentUserRequired();
            Trip newTrip = tripDataService.copySharedTrip(shareToken, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(newTrip);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }
}
