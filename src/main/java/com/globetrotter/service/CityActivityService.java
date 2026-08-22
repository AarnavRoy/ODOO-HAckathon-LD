package com.globetrotter.service;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CityActivityService {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    public List<City> searchCities(String search, String country, String region) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String countryParam = (country != null && !country.trim().isEmpty()) ? country.trim() : null;
        String regionParam = (region != null && !region.trim().isEmpty()) ? region.trim() : null;

        return cityRepository.searchCities(searchParam, countryParam, regionParam);
    }

    @Transactional
    public City upsertCity(String name, String country, Double latitude, Double longitude) {
        return cityRepository.findByNameIgnoreCaseAndCountryIgnoreCase(name, country)
                .map(existing -> {
                    // Update coords if they were missing
                    if (existing.getLatitude() == null && latitude != null) {
                        existing.setLatitude(latitude);
                        existing.setLongitude(longitude);
                        cityRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    City city = new City();
                    city.setName(name);
                    city.setCountry(country);
                    city.setLatitude(latitude);
                    city.setLongitude(longitude);
                    return cityRepository.save(city);
                });
    }


    public List<Activity> getCityActivities(Long cityId, String categoryStr, Double maxCost, Integer maxDuration) {
        Activity.ActivityCategory category = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty()) {
            try {
                category = Activity.ActivityCategory.valueOf(categoryStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        return activityRepository.findFilteredActivities(cityId, category, maxCost, maxDuration);
    }

    @Transactional
    public TripActivity addActivityToStop(Long stopId, TripActivityRequest request, User currentUser) {
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Stop not found with ID: " + stopId));

        if (!stop.getTrip().getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized: Stop does not belong to the current user's trip");
        }

        Activity activity = activityRepository.findById(request.activityId())
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with ID: " + request.activityId()));

        TripActivity tripActivity = new TripActivity();
        tripActivity.setStop(stop);
        tripActivity.setActivity(activity);
        tripActivity.setDayDate(request.dayDate());
        tripActivity.setStartTime(request.startTime());
        tripActivity.setCost(request.cost() != null ? request.cost() : activity.getCost());
        tripActivity.setNotes(request.notes());

        return tripActivityRepository.save(tripActivity);
    }

    @Transactional
    public void deleteTripActivity(Long id, User currentUser) {
        TripActivity tripActivity = tripActivityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip activity not found with ID: " + id));

        if (!tripActivity.getStop().getTrip().getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized: Trip activity does not belong to the current user's trip");
        }

        tripActivityRepository.delete(tripActivity);
    }
}
