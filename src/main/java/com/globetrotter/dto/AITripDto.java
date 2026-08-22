package com.globetrotter.dto;

import java.util.List;
import java.util.Map;

public class AITripDto {

    public record AITripRequestDto(
        String destination,
        Integer days,
        Double budget,
        Integer travelers,
        List<String> travelStyle,
        String pace,
        String preferences
    ) {}

    public record AIActivityDto(
        String name,
        String description,
        String startTime, // "09:00" ISO 24h format
        String endTime,   // "11:00"
        Double estimatedCost,
        String category,  // SIGHTSEEING, FOOD, CULTURE, RELAXATION, SHOPPING, ADVENTURE
        String cityName   // Optional: specifies city if multi-stop
    ) {}

    public record AIDayDto(
        Integer dayNumber,
        String title,
        String cityName,
        List<AIActivityDto> activities
    ) {}

    public record AITripResponseDto(
        String tripName,
        String destination,
        String summary,
        Integer duration,
        Integer travelers,
        Double budget,
        Double estimatedCost,
        String currency,
        Map<String, Double> budgetBreakdown,
        List<AIDayDto> days,
        List<String> recommendations,
        List<String> warnings
    ) {}

    public record AIRefineRequestDto(
        AITripResponseDto currentTrip,
        String action, // "reduce-cost", "relax", "add-activities", "add-food", "custom"
        String customPrompt
    ) {}
}
