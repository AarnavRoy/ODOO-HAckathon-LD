package com.globetrotter.controller;

import com.globetrotter.model.City;
import com.globetrotter.model.Stop;
import com.globetrotter.model.Trip;
import com.globetrotter.model.TripActivity;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.StopRepository;
import com.globetrotter.repository.TripActivityRepository;
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

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    public record BudgetHighlightsDto(Double totalSpent, Double saved, String status) {}
    public record DashboardResponse(List<Trip> recentTrips, List<City> recommendedCities, BudgetHighlightsDto budgetHighlights) {}

    @GetMapping
    public ResponseEntity<?> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<Trip> userTrips = tripRepository.findByUserId(userId);
        List<Trip> recentTrips = userTrips.stream().limit(5).collect(Collectors.toList());
        List<City> recommendedCities = cityRepository.findAll().stream().limit(5).collect(Collectors.toList());

        double totalSpent = 0.0;
        double totalBudget = 0.0;

        for (Trip trip : userTrips) {
            if (trip.getBudgetLimit() != null) {
                totalBudget += trip.getBudgetLimit();
            }
            List<Stop> stops = stopRepository.findByTripId(trip.getId());
            for (Stop stop : stops) {
                totalSpent += (stop.getTransportCost() != null ? stop.getTransportCost() : 0.0);
                totalSpent += (stop.getAccommodationCost() != null ? stop.getAccommodationCost() : 0.0);
            }
            List<TripActivity> activities = tripActivityRepository.findByTripId(trip.getId());
            for (TripActivity ta : activities) {
                totalSpent += (ta.getCost() != null ? ta.getCost() : 0.0);
            }
        }

        double saved = Math.max(0.0, totalBudget - totalSpent);
        String status = totalSpent > totalBudget && totalBudget > 0 ? "Over budget" : "On track";

        BudgetHighlightsDto budgetHighlights = new BudgetHighlightsDto(
                Math.round(totalSpent * 100.0) / 100.0,
                Math.round(saved * 100.0) / 100.0,
                status
        );

        return ResponseEntity.ok(new DashboardResponse(recentTrips, recommendedCities, budgetHighlights));
    }
@GetMapping("/")
public String home() {
    return "redirect:/dashboard";
}
}
