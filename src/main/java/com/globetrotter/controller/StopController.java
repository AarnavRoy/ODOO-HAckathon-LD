package com.globetrotter.controller;

import com.globetrotter.model.Stop;
import com.globetrotter.model.User;
import com.globetrotter.repository.StopRepository;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/stops")
public class StopController {

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private UserRepository userRepository;

    public record UpdateStopRequest(LocalDate startDate, LocalDate endDate, Double transportCost, Double accommodationCost) {}
    public record MessageResponse(String message) {}

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @PutMapping("/{stopId}")
    public ResponseEntity<?> updateStop(@PathVariable Long stopId, @RequestBody UpdateStopRequest request) {
        User user = getCurrentUser();
        Optional<Stop> stopOpt = stopRepository.findById(stopId);
        if (stopOpt.isEmpty() || !stopOpt.get().getTrip().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Stop not found"));
        }

        Stop stop = stopOpt.get();
        if (request.startDate() != null) stop.setStartDate(request.startDate());
        if (request.endDate() != null) stop.setEndDate(request.endDate());
        if (request.transportCost() != null) stop.setTransportCost(request.transportCost());
        if (request.accommodationCost() != null) stop.setAccommodationCost(request.accommodationCost());

        stopRepository.save(stop);
        return ResponseEntity.ok(stop);
    }

    @DeleteMapping("/{stopId}")
    public ResponseEntity<?> deleteStop(@PathVariable Long stopId) {
        User user = getCurrentUser();
        Optional<Stop> stopOpt = stopRepository.findById(stopId);
        if (stopOpt.isEmpty() || !stopOpt.get().getTrip().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Stop not found"));
        }
        
        stopRepository.delete(stopOpt.get());
        return ResponseEntity.ok(new MessageResponse("Stop deleted successfully"));
    }
}
