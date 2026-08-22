package com.globetrotter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class B2AdminController {

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("Not implemented by B1");
    }
}
