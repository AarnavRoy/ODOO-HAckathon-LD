package com.globetrotter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class B2TripDataController {

    @GetMapping("/api/trips/{tripId}/itinerary")
    public ResponseEntity<?> getTripItinerary(@PathVariable Long tripId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @GetMapping("/api/trips/{tripId}/budget")
    public ResponseEntity<?> getTripBudget(@PathVariable Long tripId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @PostMapping("/api/trips/{tripId}/share")
    public ResponseEntity<?> shareTrip(@PathVariable Long tripId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @GetMapping("/api/public/trips/{shareToken}")
    public ResponseEntity<?> getSharedTrip(@PathVariable String shareToken) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @PostMapping("/api/public/trips/{shareToken}/copy")
    public ResponseEntity<?> copySharedTrip(@PathVariable String shareToken) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }
}
