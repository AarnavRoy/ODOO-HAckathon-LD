package com.globetrotter.controller;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.TripActivity;
import com.globetrotter.model.User;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import com.globetrotter.service.CityActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class TripActivityController {

    @Autowired
    private CityActivityService cityActivityService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Unauthorized");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new SecurityException("User not found"));
    }

    @PostMapping("/api/stops/{stopId}/activities")
    public ResponseEntity<?> addActivityToStop(
            @PathVariable Long stopId,
            @RequestBody TripActivityRequest request) {
        try {
            User currentUser = getCurrentUser();
            TripActivity tripActivity = cityActivityService.addActivityToStop(stopId, request, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(tripActivity);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/api/trip-activities/{id}")
    public ResponseEntity<?> deleteTripActivity(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            cityActivityService.deleteTripActivity(id, currentUser);
            return ResponseEntity.ok(new MessageResponse("Trip activity deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        }
    }
}
