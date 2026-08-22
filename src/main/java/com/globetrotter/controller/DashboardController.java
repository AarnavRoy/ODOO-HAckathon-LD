package com.globetrotter.controller;

import com.globetrotter.model.City;
import com.globetrotter.model.Trip;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private CityRepository cityRepository;

    public record DashboardResponse(List<Trip> recentTrips, List<City> recommendedCities, Object budgetHighlights) {}

    @GetMapping
    public ResponseEntity<?> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<Trip> recentTrips = tripRepository.findByUserId(userId).stream().limit(5).collect(Collectors.toList());
        List<City> recommendedCities = cityRepository.findAll().stream().limit(5).collect(Collectors.toList());

        // Dummy budget highlights for now
        Object budgetHighlights = new Object() {
            public final String status = "On track";
        };

        return ResponseEntity.ok(new DashboardResponse(recentTrips, recommendedCities, budgetHighlights));
    }
}
