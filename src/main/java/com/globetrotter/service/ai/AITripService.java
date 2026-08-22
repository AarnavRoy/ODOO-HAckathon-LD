package com.globetrotter.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globetrotter.dto.AITripDto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AITripService {

    @Autowired
    private GeminiApiClient geminiApiClient;

    @Autowired
    private FallbackAITripGenerator fallbackGenerator;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AITripResponseDto generateTrip(AITripRequestDto request) {
        validateRequest(request);

        if (geminiApiClient.isAvailable()) {
            try {
                String systemPrompt = buildSystemPrompt();
                String userPrompt = buildUserPrompt(request);
                String jsonResult = geminiApiClient.generateTripJson(systemPrompt, userPrompt);

                if (jsonResult != null && !jsonResult.trim().isEmpty()) {
                    AITripResponseDto parsed = parseAndValidateJson(jsonResult, request);
                    if (parsed != null) {
                        return parsed;
                    }
                }
            } catch (Exception e) {
                System.err.println("[AITripService] AI Generation failed, falling back: " + e.getMessage());
            }
        }

        return fallbackGenerator.generateFallback(request);
    }

    public AITripResponseDto refineTrip(AIRefineRequestDto request) {
        if (request.currentTrip() == null) {
            throw new IllegalArgumentException("Current trip data is required for refinement.");
        }

        AITripResponseDto current = request.currentTrip();
        String action = request.action() != null ? request.action() : "reduce-cost";

        if (geminiApiClient.isAvailable()) {
            try {
                String systemPrompt = buildSystemPrompt();
                String userPrompt = buildRefinePrompt(current, action, request.customPrompt());
                String jsonResult = geminiApiClient.generateTripJson(systemPrompt, userPrompt);

                if (jsonResult != null && !jsonResult.trim().isEmpty()) {
                    AITripResponseDto parsed = parseAndValidateJson(jsonResult, null);
                    if (parsed != null) {
                        return parsed;
                    }
                }
            } catch (Exception e) {
                System.err.println("[AITripService] AI Refinement failed: " + e.getMessage());
            }
        }

        // Programmatic refinement fallback
        return fallbackRefine(current, action);
    }

    @Transactional
    public Trip saveAITrip(AITripResponseDto aiTrip, User user) {
        if (aiTrip == null || user == null) {
            throw new IllegalArgumentException("Invalid trip data or user for saving.");
        }

        Trip trip = new Trip();
        trip.setUser(user);
        trip.setName(aiTrip.tripName() != null ? aiTrip.tripName() : "AI Generated Trip");
        trip.setDescription(aiTrip.summary() != null ? aiTrip.summary() : ("AI Trip to " + aiTrip.destination()));
        trip.setStartDate(LocalDate.now());
        int duration = (aiTrip.duration() != null && aiTrip.duration() > 0) ? aiTrip.duration() : 5;
        trip.setEndDate(LocalDate.now().plusDays(duration - 1));
        trip.setBudgetLimit(aiTrip.budget() != null ? aiTrip.budget() : 20000.0);
        trip.setCoverPhotoUrl("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80");
        trip.setIsPublic(false);

        // Group days by City to create Stops
        Map<String, List<AIDayDto>> cityDaysMap = new LinkedHashMap<>();
        if (aiTrip.days() != null && !aiTrip.days().isEmpty()) {
            for (AIDayDto day : aiTrip.days()) {
                String cityName = (day.cityName() != null && !day.cityName().trim().isEmpty())
                    ? day.cityName().trim() : aiTrip.destination();
                cityDaysMap.computeIfAbsent(cityName, k -> new ArrayList<>()).add(day);
            }
        } else {
            cityDaysMap.put(aiTrip.destination(), List.of());
        }

        // Find or create Start City
        String firstCityName = cityDaysMap.keySet().iterator().next();
        City startCity = getOrCreateCity(firstCityName);
        trip.setStartCity(startCity);

        Trip savedTrip = tripRepository.save(trip);

        int orderIdx = 0;
        int totalCities = cityDaysMap.size();
        int daysPerCity = Math.max(1, duration / Math.max(1, totalCities));
        LocalDate currentStopStart = LocalDate.now();

        for (Map.Entry<String, List<AIDayDto>> entry : cityDaysMap.entrySet()) {
            String cityName = entry.getKey();
            List<AIDayDto> cityDays = entry.getValue();
            City city = getOrCreateCity(cityName);

            int cityStayDuration = cityDays.isEmpty() ? daysPerCity : cityDays.size();
            LocalDate currentStopEnd = currentStopStart.plusDays(cityStayDuration - 1);

            Stop stop = new Stop();
            stop.setTrip(savedTrip);
            stop.setCity(city);
            stop.setStartDate(currentStopStart);
            stop.setEndDate(currentStopEnd);
            stop.setOrderIndex(orderIdx++);
            
            Double budgetPerStop = (aiTrip.budgetBreakdown() != null) ? aiTrip.budgetBreakdown().get("accommodation") : 0.0;
            stop.setAccommodationCost(budgetPerStop != null ? budgetPerStop / totalCities : 0.0);
            stop.setTransportCost(0.0);

            Stop savedStop = stopRepository.save(stop);

            // Save activities under this Stop
            int dayOffset = 0;
            for (AIDayDto day : cityDays) {
                LocalDate dayDate = currentStopStart.plusDays(dayOffset++);
                if (day.activities() != null) {
                    for (AIActivityDto actDto : day.activities()) {
                        Activity activity = new Activity();
                        activity.setName(actDto.name() != null ? actDto.name() : "Activity");
                        activity.setCategory(parseCategory(actDto.category()));
                        activity.setCost(actDto.estimatedCost() != null ? actDto.estimatedCost() : 0.0);
                        Activity savedActivity = activityRepository.save(activity);

                        TripActivity tripActivity = new TripActivity();
                        tripActivity.setStop(savedStop);
                        tripActivity.setActivity(savedActivity);
                        tripActivity.setDayDate(dayDate);
                        tripActivity.setStartTime(parseIsoTime(actDto.startTime()));
                        tripActivity.setCost(actDto.estimatedCost() != null ? actDto.estimatedCost() : 0.0);
                        tripActivity.setNotes(actDto.description());
                        tripActivityRepository.save(tripActivity);
                    }
                }
            }

            currentStopStart = currentStopEnd.plusDays(1);
        }

        return savedTrip;
    }

    private void validateRequest(AITripRequestDto req) {
        if (req == null) throw new IllegalArgumentException("Request body cannot be null.");
        if (req.destination() == null || req.destination().trim().isEmpty()) {
            throw new IllegalArgumentException("Destination is required.");
        }
        if (req.days() != null && (req.days() < 1 || req.days() > 30)) {
            throw new IllegalArgumentException("Days must be between 1 and 30.");
        }
        if (req.budget() != null && req.budget() < 0) {
            throw new IllegalArgumentException("Budget cannot be negative.");
        }
    }

    private String buildSystemPrompt() {
        return """
            You are GlobeTrotter Travel Planning Engine, an expert travel planning engine.
            Return ONLY a valid JSON object matching the required schema. Do NOT include markdown code fences (like ```json), commentary, or extra text.
            
            REQUIREMENTS:
            1. All activity start times MUST be in 24-hour ISO format "HH:mm" (e.g., "09:00", "13:30", "18:00"). Never use AM/PM.
            2. The budgetBreakdown (transport, accommodation, food, activities, miscellaneous) MUST sum up closely to estimatedCost.
            3. Costs must be realistic estimates in INR.
            4. Keep activities realistic with no impossible scheduling or excessive overlapping travel.
            5. Support multi-city destinations (e.g. "Mumbai -> Goa -> Gokarna") by setting the appropriate cityName on each day.
            
            JSON SCHEMA:
            {
              "tripName": "string",
              "destination": "string",
              "summary": "string",
              "duration": number,
              "travelers": number,
              "budget": number,
              "estimatedCost": number,
              "currency": "INR",
              "budgetBreakdown": {
                "transport": number,
                "accommodation": number,
                "food": number,
                "activities": number,
                "miscellaneous": number
              },
              "days": [
                {
                  "dayNumber": number,
                  "title": "string",
                  "cityName": "string",
                  "activities": [
                    {
                      "name": "string",
                      "description": "string",
                      "startTime": "HH:mm",
                      "endTime": "HH:mm",
                      "estimatedCost": number,
                      "category": "SIGHTSEEING|FOOD|CULTURE|RELAXATION|SHOPPING|ADVENTURE",
                      "cityName": "string"
                    }
                  ]
                }
              ],
              "recommendations": ["string"],
              "warnings": ["string"]
            }
            """;
    }

    private String buildUserPrompt(AITripRequestDto req) {
        return String.format(
            "Plan a trip to %s for %d days with a budget of ₹%.0f for %d travelers. Travel style: %s. Pace: %s. Preferences: %s.",
            req.destination(),
            req.days() != null ? req.days() : 5,
            req.budget() != null ? req.budget() : 20000.0,
            req.travelers() != null ? req.travelers() : 2,
            req.travelStyle() != null ? String.join(", ", req.travelStyle()) : "balanced",
            req.pace() != null ? req.pace() : "BALANCED",
            req.preferences() != null ? req.preferences() : "None"
        );
    }

    private String buildRefinePrompt(AITripResponseDto current, String action, String customPrompt) {
        return String.format(
            "Modify this trip to %s (%d days, budget ₹%.0f). Action requested: %s. Additional instructions: %s. Return updated JSON in the exact required schema.\nCurrent Trip: %s",
            current.destination(), current.duration(), current.budget(), action,
            customPrompt != null ? customPrompt : "None",
            toJsonString(current)
        );
    }

    private AITripResponseDto parseAndValidateJson(String json, AITripRequestDto origReq) {
        try {
            String cleanJson = json.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            AITripResponseDto dto = objectMapper.readValue(cleanJson, AITripResponseDto.class);
            if (dto != null && dto.days() != null && !dto.days().isEmpty()) {
                return validateAndRepairDto(dto, origReq);
            }
        } catch (Exception e) {
            System.err.println("[AITripService] JSON parse failed: " + e.getMessage());
        }
        return null;
    }

    private AITripResponseDto validateAndRepairDto(AITripResponseDto dto, AITripRequestDto origReq) {
        double budget = dto.budget() != null ? dto.budget() : (origReq != null && origReq.budget() != null ? origReq.budget() : 20000.0);
        
        Map<String, Double> bd = dto.budgetBreakdown();
        if (bd == null || bd.isEmpty()) {
            bd = Map.of(
                "transport", Math.floor(budget * 0.25),
                "accommodation", Math.floor(budget * 0.35),
                "food", Math.floor(budget * 0.20),
                "activities", Math.floor(budget * 0.15),
                "miscellaneous", Math.floor(budget * 0.05)
            );
        }

        double calculatedEst = bd.values().stream().mapToDouble(Double::doubleValue).sum();

        // Standardize activities times to 24h ISO format "HH:mm"
        List<AIDayDto> repairedDays = new ArrayList<>();
        if (dto.days() != null) {
            for (AIDayDto day : dto.days()) {
                List<AIActivityDto> repairedActs = new ArrayList<>();
                if (day.activities() != null) {
                    for (AIActivityDto act : day.activities()) {
                        String timeStr = sanitizeIsoTime(act.startTime());
                        repairedActs.add(new AIActivityDto(
                            act.name() != null ? act.name() : "Activity",
                            act.description() != null ? act.description() : "",
                            timeStr,
                            sanitizeIsoTime(act.endTime()),
                            act.estimatedCost() != null ? act.estimatedCost() : 0.0,
                            act.category() != null ? act.category() : "SIGHTSEEING",
                            act.cityName() != null ? act.cityName() : day.cityName()
                        ));
                    }
                }
                repairedDays.add(new AIDayDto(
                    day.dayNumber() != null ? day.dayNumber() : (repairedDays.size() + 1),
                    day.title() != null ? day.title() : ("Day " + (repairedDays.size() + 1)),
                    day.cityName() != null ? day.cityName() : dto.destination(),
                    repairedActs
                ));
            }
        }

        return new AITripResponseDto(
            dto.tripName() != null ? dto.tripName() : (dto.destination() + " Explorer"),
            dto.destination() != null ? dto.destination() : "Destination",
            dto.summary() != null ? dto.summary() : "AI Planned Trip",
            dto.duration() != null ? dto.duration() : repairedDays.size(),
            dto.travelers() != null ? dto.travelers() : 2,
            budget,
            calculatedEst > 0 ? calculatedEst : budget,
            "INR",
            bd,
            repairedDays,
            dto.recommendations() != null ? dto.recommendations() : List.of("Book early to save on stay."),
            dto.warnings() != null ? dto.warnings() : List.of()
        );
    }

    private AITripResponseDto fallbackRefine(AITripResponseDto current, String action) {
        double currentEst = current.estimatedCost() != null ? current.estimatedCost() : current.budget();
        Map<String, Double> bd = new HashMap<>(current.budgetBreakdown() != null ? current.budgetBreakdown() : Map.of());
        List<String> recs = new ArrayList<>(current.recommendations() != null ? current.recommendations() : List.of());

        if ("reduce-cost".equalsIgnoreCase(action)) {
            bd.put("stay", Math.floor((bd.getOrDefault("stay", currentEst * 0.35)) * 0.8));
            bd.put("transport", Math.floor((bd.getOrDefault("transport", currentEst * 0.25)) * 0.85));
            recs.add(0, "✨ AI swapped to budget-friendly stays & transport.");
        } else if ("add-activities".equalsIgnoreCase(action)) {
            bd.put("activities", bd.getOrDefault("activities", currentEst * 0.15) + 1500);
            recs.add(0, "✨ AI added action-packed activities!");
        } else if ("add-food".equalsIgnoreCase(action)) {
            bd.put("food", bd.getOrDefault("food", currentEst * 0.20) + 1000);
            recs.add(0, "✨ AI upgraded your culinary itinerary!");
        }

        double newEst = bd.values().stream().mapToDouble(Double::doubleValue).sum();

        return new AITripResponseDto(
            current.tripName(), current.destination(), current.summary(),
            current.duration(), current.travelers(), current.budget(),
            newEst, current.currency(), bd, current.days(), recs, current.warnings()
        );
    }

    private City getOrCreateCity(String name) {
        String clean = (name != null && !name.trim().isEmpty()) ? name.trim() : "Destination";
        Optional<City> opt = cityRepository.findByNameIgnoreCase(clean);
        if (opt.isPresent()) return opt.get();
        City c = new City();
        c.setName(clean);
        c.setCountry("India");
        return cityRepository.save(c);
    }

    private LocalTime parseIsoTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) return LocalTime.of(10, 0);
        try {
            String clean = timeStr.trim();
            if (clean.length() == 4) clean = "0" + clean;
            return LocalTime.parse(clean.substring(0, 5), DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            return LocalTime.of(10, 0);
        }
    }

    private Activity.ActivityCategory parseCategory(String catStr) {
        if (catStr == null || catStr.trim().isEmpty()) return Activity.ActivityCategory.SIGHTSEEING;
        try {
            return Activity.ActivityCategory.valueOf(catStr.trim().toUpperCase());
        } catch (Exception e) {
            return Activity.ActivityCategory.SIGHTSEEING;
        }
    }

    private String sanitizeIsoTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) return "10:00";
        try {
            String t = timeStr.trim().toUpperCase();
            if (t.contains("PM") || t.contains("AM")) {
                boolean isPm = t.contains("PM");
                t = t.replaceAll("[^0-9:]", "").trim();
                String[] parts = t.split(":");
                int hour = Integer.parseInt(parts[0]);
                int min = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
                if (isPm && hour < 12) hour += 12;
                if (!isPm && hour == 12) hour = 0;
                return String.format("%02d:%02d", hour, min);
            }
            String[] parts = t.split(":");
            int hour = Integer.parseInt(parts[0]);
            int min = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
            return String.format("%02d:%02d", hour, min);
        } catch (Exception e) {
            return "10:00";
        }
    }

    private String toJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
