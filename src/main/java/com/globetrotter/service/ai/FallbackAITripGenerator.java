package com.globetrotter.service.ai;

import com.globetrotter.dto.AITripDto.*;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class FallbackAITripGenerator {

    public AITripResponseDto generateFallback(AITripRequestDto req) {
        String dest = (req.destination() != null && !req.destination().trim().isEmpty()) 
            ? req.destination().trim() : "Goa";
        int daysCount = (req.days() != null && req.days() > 0) ? Math.min(req.days(), 30) : 5;
        double budgetLimit = (req.budget() != null && req.budget() > 0) ? req.budget() : 20000.0;
        int travelers = (req.travelers() != null && req.travelers() > 0) ? req.travelers() : 2;

        double transport = Math.floor(budgetLimit * 0.25);
        double accommodation = Math.floor(budgetLimit * 0.35);
        double food = Math.floor(budgetLimit * 0.20);
        double activities = Math.floor(budgetLimit * 0.15);
        double misc = Math.floor(budgetLimit * 0.05);

        double estCost = transport + accommodation + food + activities + misc;

        Map<String, Double> breakdown = Map.of(
            "transport", transport,
            "accommodation", accommodation,
            "food", food,
            "activities", activities,
            "miscellaneous", misc
        );

        List<AIDayDto> daysList = new ArrayList<>();
        List<String> cities = parseDestinations(dest);

        for (int i = 1; i <= daysCount; i++) {
            String currentCity = cities.get((i - 1) % cities.size());
            List<AIActivityDto> dayActs = new ArrayList<>();

            if (i == 1) {
                dayActs.add(new AIActivityDto(
                    "Arrival & Check-in at " + currentCity,
                    "Check in to hotel and refresh after travel.",
                    "09:00", "11:00", 0.0, "RELAXATION", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Welcome Lunch in " + currentCity,
                    "Enjoy regional delicacies at popular local restaurant.",
                    "13:00", "14:30", Math.floor(food / (daysCount * 2)), "FOOD", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "City Landmark & Heritage Tour",
                    "Explore historic markets, architecture, and photography spots.",
                    "15:30", "18:00", Math.floor(activities / (daysCount * 2)), "CULTURE", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Sunset Dining & Lounge",
                    "Relax with dinner and night views.",
                    "20:00", "22:00", Math.floor(food / (daysCount * 2)), "RELAXATION", currentCity
                ));
            } else if (i % 2 == 0) {
                dayActs.add(new AIActivityDto(
                    currentCity + " Highlight Sightseeing",
                    "Visit top-rated natural and cultural attractions.",
                    "09:00", "12:00", Math.floor(activities / (daysCount * 2)), "SIGHTSEEING", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Local Specialty Lunch",
                    "Sample local street food and desserts.",
                    "13:00", "14:30", Math.floor(food / (daysCount * 2)), "FOOD", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Artisan Market Shopping",
                    "Pick up souvenirs and handcrafted gifts.",
                    "16:00", "18:30", Math.floor(misc / daysCount), "SHOPPING", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Evening Cultural Performance",
                    "Enjoy music and local entertainment.",
                    "20:00", "22:00", Math.floor(activities / (daysCount * 2)), "CULTURE", currentCity
                ));
            } else {
                dayActs.add(new AIActivityDto(
                    "Nature Trail & Scenic Walk",
                    "Morning outdoor walk and photo stops.",
                    "10:00", "12:30", Math.floor(activities / (daysCount * 2)), "NATURE", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Leisure Lunch & Cafe Break",
                    "Relax at recommended café.",
                    "13:30", "15:00", Math.floor(food / (daysCount * 2)), "FOOD", currentCity
                ));
                dayActs.add(new AIActivityDto(
                    "Sunset Point Experience",
                    "Watch sunset views at famous viewpoint.",
                    "17:30", "19:30", 0.0, "RELAXATION", currentCity
                ));
            }

            daysList.add(new AIDayDto(
                i,
                i == 1 ? "Arrival & Orientation in " + currentCity : (i == daysCount ? "Final Day & Departure" : "Day " + i + ": " + currentCity + " Exploration"),
                currentCity,
                dayActs
            ));
        }

        List<String> recs = List.of(
            "Book accommodation early in " + dest + " to secure the best rates.",
            "Keep local currency handy for minor expenses and local transport.",
            "Pre-book popular attraction tickets online to skip long queues."
        );

        List<String> warnings = (estCost > budgetLimit) 
            ? List.of("Estimated cost slightly exceeds target budget limit.") 
            : List.of();

        return new AITripResponseDto(
            dest + " Explorer",
            dest,
            "A balanced " + daysCount + "-day trip to " + dest + " for " + travelers + " travelers.",
            daysCount,
            travelers,
            budgetLimit,
            estCost,
            "INR",
            breakdown,
            daysList,
            recs,
            warnings
        );
    }

    private List<String> parseDestinations(String dest) {
        if (dest == null || dest.trim().isEmpty()) return List.of("Goa");
        String[] parts = dest.split("->|→|,");
        List<String> list = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim();
            if (!trimmed.isEmpty()) list.add(trimmed);
        }
        return list.isEmpty() ? List.of(dest.trim()) : list;
    }
}
