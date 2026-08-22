package com.globetrotter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cities")
public class B2CityController {

    @GetMapping
    public ResponseEntity<?> getCities(@RequestParam(required = false) String search,
                                       @RequestParam(required = false) String country,
                                       @RequestParam(required = false) String region) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }

    @GetMapping("/{cityId}/activities")
    public ResponseEntity<?> getCityActivities(@PathVariable Long cityId,
                                               @RequestParam(required = false) String category,
                                               @RequestParam(required = false) Double maxCost,
                                               @RequestParam(required = false) Integer maxDuration) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }
}
