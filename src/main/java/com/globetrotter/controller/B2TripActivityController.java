package com.globetrotter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
public class B2TripActivityController {

    public record TripActivityRequest(Long activityId, LocalDate dayDate, LocalTime startTime, Double cost, String notes) {}

    @PostMapping("/api/stops/{stopId}/activities")
    public ResponseEntity<?> addActivityToStop(@PathVariable Long stopId, @RequestBody TripActivityRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @DeleteMapping("/api/trip-activities/{id}")
    public ResponseEntity<?> deleteTripActivity(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }
}
