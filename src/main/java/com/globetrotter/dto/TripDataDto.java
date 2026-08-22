package com.globetrotter.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.globetrotter.model.Activity;
import com.globetrotter.model.City;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class TripDataDto {

    public record TripActivityRequest(
            Long activityId,
            LocalDate dayDate,
            @JsonFormat(pattern = "HH:mm") LocalTime startTime,
            Double cost,
            String notes
    ) {}

    public record TripActivityResponse(
            Long id,
            Long stopId,
            Long activityId,
            String name,
            Activity.ActivityCategory category,
            LocalDate dayDate,
            @JsonFormat(pattern = "HH:mm") LocalTime startTime,
            Double cost,
            Integer durationMinutes,
            String description,
            String imageUrl,
            String notes
    ) {}

    public record ItineraryResponse(
            List<DayItineraryDto> days
    ) {}

    public record DayItineraryDto(
            LocalDate date,
            List<StopItineraryDto> stops
    ) {}

    public record StopItineraryDto(
            City city,
            List<ItineraryActivityDto> activities
    ) {}

    public record ActivitySummaryDto(
            Long id,
            String name,
            Activity.ActivityCategory category,
            Double cost,
            Integer durationMinutes,
            String description,
            String imageUrl
    ) {}

    public record ItineraryActivityDto(
            Long id,
            Long stopId,
            Long activityId,
            String name,
            Activity.ActivityCategory category,
            LocalDate dayDate,
            @JsonFormat(pattern = "HH:mm") LocalTime startTime,
            Double cost,
            Integer durationMinutes,
            String description,
            String imageUrl,
            String notes,
            ActivitySummaryDto activity
    ) {}

    public record BudgetResponse(
            Double total,
            CategoryBudgetDto byCategory,
            List<DayBudgetDto> byDay
    ) {}

    public record CategoryBudgetDto(
            Double transport,
            Double stay,
            Double activities,
            Double meals
    ) {}

    public record DayBudgetDto(
            LocalDate date,
            Double cost,
            Boolean overBudget
    ) {}

    public record ShareResponse(
            String shareToken,
            String publicUrl
    ) {}

    public record TripDetailResponse(
            Long id,
            Long userId,
            String name,
            LocalDate startDate,
            LocalDate endDate,
            String description,
            String coverPhotoUrl,
            Boolean isPublic,
            String shareToken,
            Double budgetLimit,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<StopDetailDto> stops
    ) {}

    public record StopDetailDto(
            Long id,
            Long tripId,
            Long cityId,
            City city,
            LocalDate startDate,
            LocalDate endDate,
            Integer orderIndex,
            Double transportCost,
            Double accommodationCost,
            List<TripActivityResponse> activities
    ) {}

    public record AdminStatsResponse(
            Long totalUsers,
            Long totalTrips,
            List<TopCityDto> topCities,
            List<TopActivityDto> topActivities,
            EngagementDto engagement
    ) {}

    public record AdminOverviewResponse(
            Long totalUsers,
            Long totalTrips,
            Long totalCities,
            Long totalActivities,
            Double totalBudgetPlanned,
            Double totalBudgetSpent,
            EngagementDto engagement,
            List<UserCountryDistributionDto> userCountries
    ) {}

    public record AdminTrendPointDto(
            String date,
            Long newUsers,
            Long newTrips,
            Double budgetSpent
    ) {}

    public record CategoryDistributionDto(
            String category,
            Long count,
            Double percentage
    ) {}

    public record UserCountryDistributionDto(
            String country,
            Long userCount
    ) {}

    public record AdminUserDto(
            Long id,
            String name,
            String username,
            String email,
            String country,
            String state,
            String city,
            String profilePhotoUrl,
            String role,
            boolean isBanned,
            Long tripsCount,
            LocalDateTime createdAt,
            LocalDateTime lastLoginAt
    ) {}

    public record AdminTripDto(
            Long id,
            String name,
            Long userId,
            String userName,
            String userEmail,
            LocalDate startDate,
            LocalDate endDate,
            Double budgetLimit,
            Double totalSpent,
            Integer stopsCount,
            Integer activitiesCount,
            LocalDateTime createdAt
    ) {}

    public record UpdateUserRoleRequest(
            String role
    ) {}

    public record UpdateUserStatusRequest(
            boolean isBanned
    ) {}

    public record TopCityDto(
            Long id,
            String name,
            String country,
            String imageUrl,
            Double popularityScore,
            Long stopCount
    ) {}

    public record TopActivityDto(
            Long id,
            String name,
            Activity.ActivityCategory category,
            Double cost,
            String imageUrl,
            Long usageCount
    ) {}

    public record EngagementDto(
            Long totalTripActivities,
            Double avgTripsPerUser,
            Double avgStopsPerTrip,
            Double avgActivitiesPerTrip,
            Long dailyActive,
            Long weeklyActive
    ) {}

    public record MessageResponse(
            String message
    ) {}
}
