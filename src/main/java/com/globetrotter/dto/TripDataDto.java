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
            String notes
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

    public record TopCityDto(
            Long id,
            String name,
            String country,
            Double popularityScore,
            Long stopCount
    ) {}

    public record TopActivityDto(
            Long id,
            String name,
            Activity.ActivityCategory category,
            Double cost,
            Long usageCount
    ) {}

    public record EngagementDto(
            Long totalTripActivities,
            Double avgTripsPerUser,
            Double avgStopsPerTrip,
            Double avgActivitiesPerTrip
    ) {}

    public record MessageResponse(
            String message
    ) {}
}
