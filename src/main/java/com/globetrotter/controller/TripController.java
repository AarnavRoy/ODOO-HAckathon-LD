package com.globetrotter.controller;

import com.globetrotter.model.City;
import com.globetrotter.model.Stop;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.StopRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StopRepository stopRepository;
    
    @Autowired
    private CityRepository cityRepository;

    public record TripRequest(String name, LocalDate startDate, LocalDate endDate, String description, String coverPhotoUrl, Double budgetLimit) {}
    public record StopRequest(Long cityId, LocalDate startDate, LocalDate endDate, Double transportCost, Double accommodationCost) {}
    public record ReorderRequest(List<Long> stopIds) {}
    public record MessageResponse(String message) {}

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getTrips() {
        User user = getCurrentUser();
        List<Trip> trips = tripRepository.findByUserId(user.getId());
        return ResponseEntity.ok(trips);
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequest request) {
        User user = getCurrentUser();
        Trip trip = new Trip();
        trip.setUser(user);
        trip.setName(request.name());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());
        trip.setDescription(request.description());
        trip.setCoverPhotoUrl(request.coverPhotoUrl());
        trip.setBudgetLimit(request.budgetLimit());
        
        Trip savedTrip = tripRepository.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTrip(@PathVariable Long tripId) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        return ResponseEntity.ok(tripOpt.get());
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId, @RequestBody TripRequest request) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        Trip trip = tripOpt.get();
        if (request.name() != null) trip.setName(request.name());
        if (request.startDate() != null) trip.setStartDate(request.startDate());
        if (request.endDate() != null) trip.setEndDate(request.endDate());
        if (request.description() != null) trip.setDescription(request.description());
        if (request.coverPhotoUrl() != null) trip.setCoverPhotoUrl(request.coverPhotoUrl());
        if (request.budgetLimit() != null) trip.setBudgetLimit(request.budgetLimit());

        tripRepository.save(trip);
        return ResponseEntity.ok(trip);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        tripRepository.delete(tripOpt.get());
        return ResponseEntity.ok(new MessageResponse("Trip deleted successfully"));
    }

    @GetMapping("/{tripId}/stops")
    public ResponseEntity<?> getTripStops(@PathVariable Long tripId) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        return ResponseEntity.ok(tripOpt.get().getStops());
    }

    @PostMapping("/{tripId}/stops")
    public ResponseEntity<?> addTripStop(@PathVariable Long tripId, @RequestBody StopRequest request) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        
        Optional<City> cityOpt = cityRepository.findById(request.cityId());
        if (cityOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("City not found"));
        }

        Trip trip = tripOpt.get();
        Stop stop = new Stop();
        stop.setTrip(trip);
        stop.setCity(cityOpt.get());
        stop.setStartDate(request.startDate());
        stop.setEndDate(request.endDate());
        stop.setTransportCost(request.transportCost());
        stop.setAccommodationCost(request.accommodationCost());
        
        int orderIndex = trip.getStops() == null ? 0 : trip.getStops().size();
        stop.setOrderIndex(orderIndex);

        Stop savedStop = stopRepository.save(stop);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStop);
    }

    @PutMapping("/{tripId}/stops/reorder")
    public ResponseEntity<?> reorderStops(@PathVariable Long tripId, @RequestBody ReorderRequest request) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }
        
        List<Stop> stops = tripOpt.get().getStops();
        for (int i = 0; i < request.stopIds().size(); i++) {
            Long sId = request.stopIds().get(i);
            for (Stop s : stops) {
                if (s.getId().equals(sId)) {
                    s.setOrderIndex(i);
                    stopRepository.save(s);
                    break;
                }
            }
        }
        
        return ResponseEntity.ok(tripOpt.get().getStops());
    }
}
