package com.globetrotter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LocationService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, List<String>> countryStatesCache = new ConcurrentHashMap<>();
    private final Map<String, List<String>> stateCitiesCache = new ConcurrentHashMap<>();
    private final List<Map<String, String>> cachedCountries = new ArrayList<>();

    // Standard fallback countries for guaranteed availability
    private static final List<String> POPULAR_COUNTRIES = List.of(
        "United States", "India", "United Kingdom", "Canada", "Australia",
        "France", "Germany", "Japan", "Italy", "Spain", "Brazil", "South Africa",
        "United Arab Emirates", "Singapore", "Switzerland", "Netherlands", "Mexico"
    );

    public record LocationValidationResult(boolean valid, String message) {}

    /**
     * Get list of all countries
     */
    public List<Map<String, String>> getCountries() {
        if (!cachedCountries.isEmpty()) {
            return cachedCountries;
        }

        try {
            URI uri = URI.create("https://countriesnow.space/api/v0.1/countries/iso");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                JsonNode root = objectMapper.readTree(reader);
                reader.close();

                JsonNode data = root.get("data");
                if (data != null && data.isArray()) {
                    for (JsonNode item : data) {
                        Map<String, String> c = new HashMap<>();
                        c.put("name", item.path("name").asText());
                        c.put("iso2", item.path("Iso2").asText());
                        c.put("iso3", item.path("Iso3").asText());
                        cachedCountries.add(c);
                    }
                    cachedCountries.sort(Comparator.comparing(a -> a.get("name")));
                    return cachedCountries;
                }
            }
        } catch (Exception ignored) {}

        // Fallback if network is unavailable
        for (String country : POPULAR_COUNTRIES) {
            Map<String, String> c = new HashMap<>();
            c.put("name", country);
            c.put("iso2", country.substring(0, Math.min(2, country.length())).toUpperCase());
            cachedCountries.add(c);
        }
        return cachedCountries;
    }

    /**
     * Get states/provinces of a country
     */
    public List<String> getStates(String country) {
        if (country == null || country.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String cleanCountry = country.trim();
        String cacheKey = cleanCountry.toLowerCase();

        if (countryStatesCache.containsKey(cacheKey)) {
            return countryStatesCache.get(cacheKey);
        }

        List<String> states = new ArrayList<>();
        try {
            URI uri = URI.create("https://countriesnow.space/api/v0.1/countries/states");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestProperty("Content-Type", "application/json");

            String payload = "{\"country\":\"" + cleanCountry.replace("\"", "") + "\"}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes(StandardCharsets.UTF_8));
            }

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                JsonNode root = objectMapper.readTree(reader);
                reader.close();

                JsonNode statesNode = root.path("data").path("states");
                if (statesNode.isArray()) {
                    for (JsonNode s : statesNode) {
                        String name = s.path("name").asText();
                        if (!name.isEmpty()) states.add(name);
                    }
                }
            }
        } catch (Exception ignored) {}

        states.sort(String.CASE_INSENSITIVE_ORDER);
        countryStatesCache.put(cacheKey, states);
        return states;
    }

    /**
     * Get cities of a state in a country
     */
    public List<String> getCities(String country, String state) {
        if (country == null || country.trim().isEmpty() || state == null || state.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String cleanCountry = country.trim();
        String cleanState = state.trim();
        String cacheKey = (cleanCountry + "_" + cleanState).toLowerCase();

        if (stateCitiesCache.containsKey(cacheKey)) {
            return stateCitiesCache.get(cacheKey);
        }

        List<String> cities = new ArrayList<>();
        try {
            URI uri = URI.create("https://countriesnow.space/api/v0.1/countries/state/cities");
            HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestProperty("Content-Type", "application/json");

            String payload = "{\"country\":\"" + cleanCountry.replace("\"", "") + "\",\"state\":\"" + cleanState.replace("\"", "") + "\"}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload.getBytes(StandardCharsets.UTF_8));
            }

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                JsonNode root = objectMapper.readTree(reader);
                reader.close();

                JsonNode citiesNode = root.path("data");
                if (citiesNode.isArray()) {
                    for (JsonNode c : citiesNode) {
                        String name = c.asText();
                        if (!name.isEmpty()) cities.add(name);
                    }
                }
            }
        } catch (Exception ignored) {}

        cities.sort(String.CASE_INSENSITIVE_ORDER);
        stateCitiesCache.put(cacheKey, cities);
        return cities;
    }

    /**
     * Strictly validate the Country -> State -> City hierarchy
     */
    public LocationValidationResult validateLocation(String country, String state, String city) {
        if ((country == null || country.trim().isEmpty()) &&
            (state == null || state.trim().isEmpty()) &&
            (city == null || city.trim().isEmpty())) {
            return new LocationValidationResult(true, "Location is empty");
        }

        if (country == null || country.trim().isEmpty()) {
            return new LocationValidationResult(false, "Country is required when state or city is specified.");
        }

        String cleanCountry = country.trim();
        String cleanState = state != null ? state.trim() : "";
        String cleanCity = city != null ? city.trim() : "";

        // Check if country exists
        List<Map<String, String>> countries = getCountries();
        boolean countryExists = countries.stream()
                .anyMatch(c -> c.get("name").equalsIgnoreCase(cleanCountry) ||
                               cleanCountry.equalsIgnoreCase(c.get("iso2")) ||
                               cleanCountry.equalsIgnoreCase(c.get("iso3")));

        if (!countryExists && !POPULAR_COUNTRIES.contains(cleanCountry)) {
            return new LocationValidationResult(false, "Invalid Country: '" + cleanCountry + "' is not recognized.");
        }

        // If State is provided, verify it belongs to Country
        if (!cleanState.isEmpty()) {
            List<String> validStates = getStates(cleanCountry);
            if (!validStates.isEmpty()) {
                boolean stateMatches = validStates.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(cleanState));
                if (!stateMatches) {
                    return new LocationValidationResult(false, "Invalid State: '" + cleanState + "' does not belong to '" + cleanCountry + "'.");
                }
            }

            // If City is provided, verify it belongs to State
            if (!cleanCity.isEmpty()) {
                List<String> validCities = getCities(cleanCountry, cleanState);
                if (!validCities.isEmpty()) {
                    boolean cityMatches = validCities.stream()
                            .anyMatch(c -> c.equalsIgnoreCase(cleanCity));
                    if (!cityMatches) {
                        return new LocationValidationResult(false, "Invalid City: '" + cleanCity + "' does not belong to '" + cleanState + ", " + cleanCountry + "'.");
                    }
                }
            }
        }

        return new LocationValidationResult(true, "Location hierarchy is valid.");
    }
}
