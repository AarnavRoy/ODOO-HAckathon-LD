package com.globetrotter.controller;

import com.globetrotter.service.LocationService;
import com.globetrotter.service.LocationService.LocationValidationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    public record ValidateLocationRequest(String country, String state, String city) {}

    @GetMapping("/countries")
    public ResponseEntity<List<Map<String, String>>> getCountries() {
        return ResponseEntity.ok(locationService.getCountries());
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates(@RequestParam("country") String country) {
        return ResponseEntity.ok(locationService.getStates(country));
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities(@RequestParam("country") String country,
                                                  @RequestParam("state") String state) {
        return ResponseEntity.ok(locationService.getCities(country, state));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateLocation(@RequestBody ValidateLocationRequest request) {
        LocationValidationResult result = locationService.validateLocation(
            request.country(), request.state(), request.city()
        );
        if (!result.valid()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", result.message()));
        }
        return ResponseEntity.ok(Map.of("valid", true, "message", result.message()));
    }
}
