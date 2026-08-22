package com.globetrotter.controller;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.service.AdminStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminStatsService adminStatsService;

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewResponse> getAdminOverview() {
        return ResponseEntity.ok(adminStatsService.getAdminOverview());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminStatsService.getAdminStats());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<AdminTrendPointDto>> getTrends(
            @RequestParam(name = "period", defaultValue = "14d") String period
    ) {
        return ResponseEntity.ok(adminStatsService.getTrends(period));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDistributionDto>> getCategoryDistribution() {
        return ResponseEntity.ok(adminStatsService.getCategoryDistribution());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers(
            @RequestParam(name = "search", required = false) String search
    ) {
        return ResponseEntity.ok(adminStatsService.getAllAdminUsers(search));
    }

    @GetMapping("/trips")
    public ResponseEntity<List<AdminTripDto>> getAllTrips(
            @RequestParam(name = "search", required = false) String search
    ) {
        return ResponseEntity.ok(adminStatsService.getAllAdminTrips(search));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable("userId") Long userId,
            @RequestBody UpdateUserRoleRequest request
    ) {
        boolean success = adminStatsService.updateUserRole(userId, request.role());
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "User role updated successfully to " + request.role()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserBanStatus(
            @PathVariable("userId") Long userId,
            @RequestBody UpdateUserStatusRequest request
    ) {
        boolean success = adminStatsService.updateUserBanStatus(userId, request.isBanned());
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "User status updated (Banned: " + request.isBanned() + ")"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable("userId") Long userId) {
        boolean success = adminStatsService.deleteUser(userId);
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
