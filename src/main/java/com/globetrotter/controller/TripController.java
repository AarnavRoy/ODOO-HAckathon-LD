package com.globetrotter.controller;

import com.globetrotter.model.TripActivity;
import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.model.Stop;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.ActivityRepository;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.StopRepository;
import com.globetrotter.repository.TripActivityRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import com.globetrotter.service.CityActivityService;
import com.globetrotter.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String UPLOAD_DIR = "./uploads/trip-covers";

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StopRepository stopRepository;
    
    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    @Autowired
    private CityActivityService cityActivityService;

    public record TripRequest(String name, LocalDate startDate, LocalDate endDate, String description, String coverPhotoUrl, Double budgetLimit, Long startCityId) {}
    public record StopRequest(Long cityId, LocalDate startDate, LocalDate endDate, Double transportCost, Double accommodationCost,
                              String transportMode, String departureTerminal, String arrivalTerminal,
                              String departureTime, String arrivalTime, String bookingReference, Double distanceKm,
                              String accommodationName, String accommodationCheckin, String accommodationCheckout,
                              String accommodationBookingRef, String accommodationNotes, String notes) {}
    public record ReorderRequest(List<Long> stopIds) {}
    public record MessageResponse(String message) {}
    
    public record AIActivityRequest(String name, String description, String category, Double cost, String time) {}
    public record AIDayRequest(Integer dayNumber, String title, List<AIActivityRequest> activities) {}
    public record AIImportRequest(String tripName, String startCityName, String destinationName, Integer duration, Double budget, LocalDate startDate, List<AIDayRequest> days) {}

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
    public ResponseEntity<Trip> createTrip(@RequestBody TripRequest request) {
        User user = getCurrentUser();
        Trip trip = new Trip();
        trip.setUser(user);
        trip.setName(request.name());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());
        trip.setDescription(request.description());
        trip.setCoverPhotoUrl(request.coverPhotoUrl());
        trip.setBudgetLimit(request.budgetLimit());
        
        if (request.startCityId() != null) {
            cityRepository.findById(request.startCityId()).ifPresent(trip::setStartCity);
        }

        Trip savedTrip = tripRepository.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
    }

    @PostMapping("/ai-import")
    public ResponseEntity<Trip> importAITrip(@RequestBody AIImportRequest request) {
        User user = getCurrentUser();
        
        // 1. Upsert Start City
        City startCity = null;
        if (request.startCityName() != null && !request.startCityName().trim().isEmpty()) {
            startCity = cityActivityService.upsertCity(request.startCityName(), "Unknown", null, null);
        }
        
        // 2. Upsert Destination City
        City destCity = cityActivityService.upsertCity(request.destinationName(), "Unknown", null, null);
        
        // 3. Create Trip
        Trip trip = new Trip();
        trip.setUser(user);
        trip.setName(request.tripName());
        trip.setStartDate(request.startDate());
        LocalDate endDate = request.startDate().plusDays(request.duration() - 1);
        trip.setEndDate(endDate);
        trip.setBudgetLimit(request.budget());
        trip.setDescription("AI Generated Trip to " + request.destinationName());
        trip.setCoverPhotoUrl("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800");
        if (startCity != null) {
            trip.setStartCity(startCity);
        }
        Trip savedTrip = tripRepository.save(trip);
        
        // 4. Create Stop (spanning entire duration)
        Stop stop = new Stop();
        stop.setTrip(savedTrip);
        stop.setCity(destCity);
        stop.setStartDate(request.startDate());
        stop.setEndDate(endDate);
        stop.setOrderIndex(0);
        Stop savedStop = stopRepository.save(stop);
        
        // 5. Create Activities
        if (request.days() != null) {
            for (AIDayRequest day : request.days()) {
                LocalDate dayDate = request.startDate().plusDays(day.dayNumber() - 1);
                
                if (day.activities() != null) {
                    for (AIActivityRequest actReq : day.activities()) {
                        // Create global activity
                        Activity activity = new Activity();
                        activity.setCity(destCity);
                        activity.setName(actReq.name());
                        activity.setDescription(actReq.description());
                        activity.setCost(actReq.cost());
                        
                        Activity.ActivityCategory cat = Activity.ActivityCategory.OTHER;
                        try {
                            if (actReq.category() != null) {
                                cat = Activity.ActivityCategory.valueOf(actReq.category().toUpperCase());
                            }
                        } catch (Exception ignored) {}
                        activity.setCategory(cat);
                        
                        Activity savedActivity = activityRepository.save(activity);
                        
                        // Create TripActivity linkage
                        TripActivity tripActivity = new TripActivity();
                        tripActivity.setStop(savedStop);
                        tripActivity.setActivity(savedActivity);
                        tripActivity.setDayDate(dayDate);
                        tripActivity.setCost(actReq.cost());
                        
                        try {
                            if (actReq.time() != null) {
                                tripActivity.setStartTime(java.time.LocalTime.parse(actReq.time()));
                            }
                        } catch (Exception ignored) {}
                        
                        tripActivityRepository.save(tripActivity);
                    }
                }
            }
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
    }

    @PostMapping("/{tripId}/cover-photo")
    public ResponseEntity<?> uploadCoverPhoto(@PathVariable Long tripId, @RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty() || !tripOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Trip not found"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Only image files are allowed (JPEG, PNG, GIF, WebP)")
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(
                new MessageResponse("Image must be smaller than 5MB")
            );
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = switch (contentType) {
                    case "image/jpeg" -> ".jpg";
                    case "image/png" -> ".png";
                    case "image/gif" -> ".gif";
                    case "image/webp" -> ".webp";
                    default -> ".jpg";
                };
            }

            String filename = "trip_" + tripId + "_" + System.currentTimeMillis() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/api/uploads/trip-covers/" + filename;
            Trip trip = tripOpt.get();
            trip.setCoverPhotoUrl(photoUrl);
            tripRepository.save(trip);

            return ResponseEntity.ok(Map.of("coverPhotoUrl", photoUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                new MessageResponse("Failed to upload file: " + e.getMessage())
            );
        }
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
        if (request.transportMode() != null) stop.setTransportMode(request.transportMode());
        if (request.departureTerminal() != null) stop.setDepartureTerminal(request.departureTerminal());
        if (request.arrivalTerminal() != null) stop.setArrivalTerminal(request.arrivalTerminal());
        if (request.departureTime() != null) stop.setDepartureTime(request.departureTime());
        if (request.arrivalTime() != null) stop.setArrivalTime(request.arrivalTime());
        if (request.bookingReference() != null) stop.setBookingReference(request.bookingReference());
        if (request.distanceKm() != null) stop.setDistanceKm(request.distanceKm());
        if (request.accommodationName() != null) stop.setAccommodationName(request.accommodationName());
        if (request.accommodationCheckin() != null) stop.setAccommodationCheckin(request.accommodationCheckin());
        if (request.accommodationCheckout() != null) stop.setAccommodationCheckout(request.accommodationCheckout());
        if (request.accommodationBookingRef() != null) stop.setAccommodationBookingRef(request.accommodationBookingRef());
        if (request.accommodationNotes() != null) stop.setAccommodationNotes(request.accommodationNotes());
        if (request.notes() != null) stop.setNotes(request.notes());
        
        int orderIndex = trip.getStops() == null ? 0 : trip.getStops().size();
        stop.setOrderIndex(orderIndex);

        Stop savedStop = stopRepository.save(stop);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStop);
    }

    @PatchMapping("/stops/{stopId}")
    public ResponseEntity<?> updateStop(@PathVariable Long stopId, @RequestBody StopRequest request) {
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
        if (request.transportMode() != null) stop.setTransportMode(request.transportMode());
        if (request.departureTerminal() != null) stop.setDepartureTerminal(request.departureTerminal());
        if (request.arrivalTerminal() != null) stop.setArrivalTerminal(request.arrivalTerminal());
        if (request.departureTime() != null) stop.setDepartureTime(request.departureTime());
        if (request.arrivalTime() != null) stop.setArrivalTime(request.arrivalTime());
        if (request.bookingReference() != null) stop.setBookingReference(request.bookingReference());
        if (request.distanceKm() != null) stop.setDistanceKm(request.distanceKm());
        if (request.accommodationName() != null) stop.setAccommodationName(request.accommodationName());
        if (request.accommodationCheckin() != null) stop.setAccommodationCheckin(request.accommodationCheckin());
        if (request.accommodationCheckout() != null) stop.setAccommodationCheckout(request.accommodationCheckout());
        if (request.accommodationBookingRef() != null) stop.setAccommodationBookingRef(request.accommodationBookingRef());
        if (request.accommodationNotes() != null) stop.setAccommodationNotes(request.accommodationNotes());
        if (request.notes() != null) stop.setNotes(request.notes());
        stopRepository.save(stop);
        return ResponseEntity.ok(stop);
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
