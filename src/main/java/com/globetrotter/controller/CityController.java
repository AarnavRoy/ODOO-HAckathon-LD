package com.globetrotter.controller;

import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.service.CityActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    @Autowired
    private CityActivityService cityActivityService;

    public record UpsertCityRequest(String name, String country, Double latitude, Double longitude) {}

    @GetMapping
    public ResponseEntity<List<City>> getCities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String region) {
        List<City> cities = cityActivityService.searchCities(search, country, region);
        return ResponseEntity.ok(cities);
    }

    @PostMapping("/upsert")
    public ResponseEntity<City> upsertCity(@RequestBody UpsertCityRequest request) {
        City city = cityActivityService.upsertCity(
                request.name(), request.country(), request.latitude(), request.longitude());
        return ResponseEntity.ok(city);
    }

    @GetMapping("/{cityId}/activities")
    public ResponseEntity<List<Activity>> getCityActivities(
            @PathVariable Long cityId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxCost,
            @RequestParam(required = false) Integer maxDuration) {
        List<Activity> activities = cityActivityService.getCityActivities(cityId, category, maxCost, maxDuration);
        return ResponseEntity.ok(activities);
    }
}

