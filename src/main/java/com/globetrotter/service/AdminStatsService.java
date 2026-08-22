package com.globetrotter.service;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.model.Stop;
import com.globetrotter.model.TripActivity;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminStatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalTripActivities = tripActivityRepository.count();
        long totalStops = stopRepository.count();

        List<City> allCities = cityRepository.findAll();
        List<Stop> allStops = stopRepository.findAll();
        Map<Long, Long> cityStopCounts = allStops.stream()
                .filter(s -> s.getCity() != null)
                .collect(Collectors.groupingBy(s -> s.getCity().getId(), Collectors.counting()));

        List<TopCityDto> topCities = allCities.stream()
                .sorted((c1, c2) -> {
                    long count1 = cityStopCounts.getOrDefault(c1.getId(), 0L);
                    long count2 = cityStopCounts.getOrDefault(c2.getId(), 0L);
                    if (count1 != count2) {
                        return Long.compare(count2, count1);
                    }
                    double pop1 = c1.getPopularityScore() != null ? c1.getPopularityScore() : 0.0;
                    double pop2 = c2.getPopularityScore() != null ? c2.getPopularityScore() : 0.0;
                    return Double.compare(pop2, pop1);
                })
                .limit(5)
                .map(c -> new TopCityDto(
                        c.getId(),
                        c.getName(),
                        c.getCountry(),
                        c.getImageUrl(),
                        c.getPopularityScore(),
                        cityStopCounts.getOrDefault(c.getId(), 0L)
                ))
                .collect(Collectors.toList());

        List<Activity> allActivities = activityRepository.findAll();
        List<TripActivity> allTripActivities = tripActivityRepository.findAll();
        Map<Long, Long> activityUsageCounts = allTripActivities.stream()
                .filter(ta -> ta.getActivity() != null)
                .collect(Collectors.groupingBy(ta -> ta.getActivity().getId(), Collectors.counting()));

        List<TopActivityDto> topActivities = allActivities.stream()
                .sorted((a1, a2) -> {
                    long count1 = activityUsageCounts.getOrDefault(a1.getId(), 0L);
                    long count2 = activityUsageCounts.getOrDefault(a2.getId(), 0L);
                    if (count1 != count2) {
                        return Long.compare(count2, count1);
                    }
                    double cost1 = a1.getCost() != null ? a1.getCost() : 0.0;
                    double cost2 = a2.getCost() != null ? a2.getCost() : 0.0;
                    return Double.compare(cost2, cost1);
                })
                .limit(5)
                .map(a -> new TopActivityDto(
                        a.getId(),
                        a.getName(),
                        a.getCategory(),
                        a.getCost(),
                        a.getImageUrl(),
                        activityUsageCounts.getOrDefault(a.getId(), 0L)
                ))
                .collect(Collectors.toList());

        double avgTripsPerUser = totalUsers > 0 ? Math.round(((double) totalTrips / totalUsers) * 100.0) / 100.0 : 0.0;
        double avgStopsPerTrip = totalTrips > 0 ? Math.round(((double) totalStops / totalTrips) * 100.0) / 100.0 : 0.0;
        double avgActivitiesPerTrip = totalTrips > 0 ? Math.round(((double) totalTripActivities / totalTrips) * 100.0) / 100.0 : 0.0;
        long dailyActive = Math.max(1, totalUsers);
        long weeklyActive = Math.max(1, totalUsers);

        EngagementDto engagement = new EngagementDto(
                totalTripActivities,
                avgTripsPerUser,
                avgStopsPerTrip,
                avgActivitiesPerTrip,
                dailyActive,
                weeklyActive
        );

        return new AdminStatsResponse(
                totalUsers,
                totalTrips,
                topCities,
                topActivities,
                engagement
        );
    }
}
