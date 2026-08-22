package com.globetrotter.service;

import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripDataService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public ItineraryResponse getTripItinerary(Long tripId, User currentUser) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (!Boolean.TRUE.equals(trip.getIsPublic()) && (currentUser == null || !trip.getUser().getId().equals(currentUser.getId()))) {
            throw new SecurityException("Unauthorized access to private trip itinerary");
        }

        List<Stop> stops = stopRepository.findByTripIdOrderByOrderIndexAsc(tripId);
        List<TripActivity> allActivities = tripActivityRepository.findByTripId(tripId);

        // Collect all distinct dates to build itinerary
        Set<LocalDate> dateSet = new TreeSet<>();
        if (trip.getStartDate() != null && trip.getEndDate() != null && !trip.getStartDate().isAfter(trip.getEndDate())) {
            LocalDate curr = trip.getStartDate();
            while (!curr.isAfter(trip.getEndDate())) {
                dateSet.add(curr);
                curr = curr.plusDays(1);
            }
        }

        for (Stop stop : stops) {
            if (stop.getStartDate() != null) dateSet.add(stop.getStartDate());
            if (stop.getEndDate() != null) dateSet.add(stop.getEndDate());
        }

        for (TripActivity ta : allActivities) {
            if (ta.getDayDate() != null) {
                dateSet.add(ta.getDayDate());
            }
        }

        List<DayItineraryDto> days = new ArrayList<>();
        for (LocalDate date : dateSet) {
            List<StopItineraryDto> dayStops = new ArrayList<>();

            for (Stop stop : stops) {
                boolean isActiveOnDate = (stop.getStartDate() == null || !date.isBefore(stop.getStartDate()))
                        && (stop.getEndDate() == null || !date.isAfter(stop.getEndDate()));

                List<TripActivity> stopActivitiesOnDate = allActivities.stream()
                        .filter(ta -> ta.getStop().getId().equals(stop.getId()) && date.equals(ta.getDayDate()))
                        .sorted(Comparator.comparing(ta -> ta.getStartTime() != null ? ta.getStartTime().toString() : "00:00"))
                        .toList();

                if (isActiveOnDate || !stopActivitiesOnDate.isEmpty()) {
                    List<ItineraryActivityDto> activityDtos = stopActivitiesOnDate.stream()
                            .map(ta -> {
                                ActivitySummaryDto actSummary = new ActivitySummaryDto(
                                        ta.getActivity().getId(),
                                        ta.getActivity().getName(),
                                        ta.getActivity().getCategory(),
                                        ta.getActivity().getCost(),
                                        ta.getActivity().getDurationMinutes(),
                                        ta.getActivity().getDescription(),
                                        ta.getActivity().getImageUrl()
                                );
                                return new ItineraryActivityDto(
                                        ta.getId(),
                                        stop.getId(),
                                        ta.getActivity().getId(),
                                        ta.getActivity().getName(),
                                        ta.getActivity().getCategory(),
                                        ta.getDayDate(),
                                        ta.getStartTime(),
                                        ta.getCost() != null ? ta.getCost() : 0.0,
                                        ta.getActivity().getDurationMinutes(),
                                        ta.getActivity().getDescription(),
                                        ta.getActivity().getImageUrl(),
                                        ta.getNotes(),
                                        actSummary
                                );
                            })
                            .collect(Collectors.toList());

                    dayStops.add(new StopItineraryDto(stop.getCity(), activityDtos));
                }
            }

            days.add(new DayItineraryDto(date, dayStops));
        }

        return new ItineraryResponse(days);
    }

    @Transactional(readOnly = true)
    public BudgetResponse getTripBudget(Long tripId, User currentUser) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (!Boolean.TRUE.equals(trip.getIsPublic()) && (currentUser == null || !trip.getUser().getId().equals(currentUser.getId()))) {
            throw new SecurityException("Unauthorized access to private trip budget");
        }

        List<Stop> stops = stopRepository.findByTripId(tripId);
        List<TripActivity> activities = tripActivityRepository.findByTripId(tripId);

        double transport = stops.stream()
                .mapToDouble(s -> s.getTransportCost() != null ? s.getTransportCost() : 0.0)
                .sum();

        double stay = stops.stream()
                .mapToDouble(s -> s.getAccommodationCost() != null ? s.getAccommodationCost() : 0.0)
                .sum();

        double activitiesCost = activities.stream()
                .filter(ta -> ta.getActivity() != null && ta.getActivity().getCategory() != Activity.ActivityCategory.FOOD)
                .mapToDouble(ta -> ta.getCost() != null ? ta.getCost() : 0.0)
                .sum();

        double mealsCost = activities.stream()
                .filter(ta -> ta.getActivity() != null && ta.getActivity().getCategory() == Activity.ActivityCategory.FOOD)
                .mapToDouble(ta -> ta.getCost() != null ? ta.getCost() : 0.0)
                .sum();

        double total = transport + stay + activitiesCost + mealsCost;

        // Daily breakdown calculation
        Set<LocalDate> dateSet = new TreeSet<>();
        if (trip.getStartDate() != null && trip.getEndDate() != null && !trip.getStartDate().isAfter(trip.getEndDate())) {
            LocalDate curr = trip.getStartDate();
            while (!curr.isAfter(trip.getEndDate())) {
                dateSet.add(curr);
                curr = curr.plusDays(1);
            }
        }
        for (TripActivity ta : activities) {
            if (ta.getDayDate() != null) {
                dateSet.add(ta.getDayDate());
            }
        }

        long totalTripDays = (trip.getStartDate() != null && trip.getEndDate() != null && !trip.getStartDate().isAfter(trip.getEndDate()))
                ? ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1
                : Math.max(1, dateSet.size());

        Double dailyBudgetLimit = (trip.getBudgetLimit() != null && trip.getBudgetLimit() > 0 && totalTripDays > 0)
                ? (trip.getBudgetLimit() / (double) totalTripDays)
                : null;

        List<DayBudgetDto> byDay = new ArrayList<>();
        for (LocalDate date : dateSet) {
            double dayActivityCost = activities.stream()
                    .filter(ta -> date.equals(ta.getDayDate()))
                    .mapToDouble(ta -> ta.getCost() != null ? ta.getCost() : 0.0)
                    .sum();

            double dayTransportCost = stops.stream()
                    .filter(s -> date.equals(s.getStartDate()))
                    .mapToDouble(s -> s.getTransportCost() != null ? s.getTransportCost() : 0.0)
                    .sum();

            double dayStayCost = 0.0;
            for (Stop s : stops) {
                if (s.getStartDate() != null && s.getEndDate() != null && !s.getStartDate().isAfter(s.getEndDate())) {
                    if (!date.isBefore(s.getStartDate()) && !date.isAfter(s.getEndDate())) {
                        long stopDays = ChronoUnit.DAYS.between(s.getStartDate(), s.getEndDate()) + 1;
                        if (stopDays > 0 && s.getAccommodationCost() != null) {
                            dayStayCost += s.getAccommodationCost() / (double) stopDays;
                        }
                    }
                } else if (date.equals(s.getStartDate()) && s.getAccommodationCost() != null) {
                    dayStayCost += s.getAccommodationCost();
                }
            }

            double dayTotalCost = Math.round((dayActivityCost + dayTransportCost + dayStayCost) * 100.0) / 100.0;
            boolean overBudget = (dailyBudgetLimit != null) && (dayTotalCost > dailyBudgetLimit);

            byDay.add(new DayBudgetDto(date, dayTotalCost, overBudget));
        }

        return new BudgetResponse(
                Math.round(total * 100.0) / 100.0,
                new CategoryBudgetDto(
                        Math.round(transport * 100.0) / 100.0,
                        Math.round(stay * 100.0) / 100.0,
                        Math.round(activitiesCost * 100.0) / 100.0,
                        Math.round(mealsCost * 100.0) / 100.0
                ),
                byDay
        );
    }

    @Transactional
    public ShareResponse shareTrip(Long tripId, User currentUser) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (!trip.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized: Cannot share a trip owned by another user");
        }

        if (trip.getShareToken() == null || trip.getShareToken().trim().isEmpty()) {
            trip.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        }
        trip.setIsPublic(true);

        Trip savedTrip = tripRepository.save(trip);
        String publicUrl = "http://localhost:5173/share/" + savedTrip.getShareToken();

        return new ShareResponse(savedTrip.getShareToken(), publicUrl);
    }

    @Transactional(readOnly = true)
    public TripDetailResponse getSharedTrip(String shareToken) {
        Trip trip = tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new IllegalArgumentException("Shared trip not found with token: " + shareToken));

        if (!Boolean.TRUE.equals(trip.getIsPublic())) {
            throw new IllegalArgumentException("This trip is not public");
        }

        List<Stop> stops = stopRepository.findByTripIdOrderByOrderIndexAsc(trip.getId());
        List<TripActivity> allActivities = tripActivityRepository.findByTripId(trip.getId());

        List<StopDetailDto> stopDtos = stops.stream().map(stop -> {
            List<TripActivityResponse> actDtos = allActivities.stream()
                    .filter(ta -> ta.getStop().getId().equals(stop.getId()))
                    .map(ta -> new TripActivityResponse(
                            ta.getId(),
                            stop.getId(),
                            ta.getActivity().getId(),
                            ta.getActivity().getName(),
                            ta.getActivity().getCategory(),
                            ta.getDayDate(),
                            ta.getStartTime(),
                            ta.getCost(),
                            ta.getActivity().getDurationMinutes(),
                            ta.getActivity().getDescription(),
                            ta.getActivity().getImageUrl(),
                            ta.getNotes()
                    ))
                    .collect(Collectors.toList());

            return new StopDetailDto(
                    stop.getId(),
                    trip.getId(),
                    stop.getCity() != null ? stop.getCity().getId() : null,
                    stop.getCity(),
                    stop.getStartDate(),
                    stop.getEndDate(),
                    stop.getOrderIndex(),
                    stop.getTransportCost(),
                    stop.getAccommodationCost(),
                    actDtos
            );
        }).collect(Collectors.toList());

        return new TripDetailResponse(
                trip.getId(),
                trip.getUser().getId(),
                trip.getName(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getDescription(),
                trip.getCoverPhotoUrl(),
                trip.getIsPublic(),
                trip.getShareToken(),
                trip.getBudgetLimit(),
                trip.getCreatedAt(),
                trip.getUpdatedAt(),
                stopDtos
        );
    }

    @Transactional
    public Trip copySharedTrip(String shareToken, User currentUser) {
        Trip originalTrip = tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new IllegalArgumentException("Shared trip not found with token: " + shareToken));

        if (!Boolean.TRUE.equals(originalTrip.getIsPublic())) {
            throw new IllegalArgumentException("Trip is not public and cannot be copied");
        }

        // 1. Deep-copy Trip
        Trip newTrip = new Trip();
        newTrip.setUser(currentUser);
        newTrip.setName("Copy of " + originalTrip.getName());
        newTrip.setStartDate(originalTrip.getStartDate());
        newTrip.setEndDate(originalTrip.getEndDate());
        newTrip.setDescription(originalTrip.getDescription());
        newTrip.setCoverPhotoUrl(originalTrip.getCoverPhotoUrl());
        newTrip.setBudgetLimit(originalTrip.getBudgetLimit());
        newTrip.setIsPublic(false);
        newTrip.setShareToken(null);

        Trip savedTrip = tripRepository.save(newTrip);

        // 2. Deep-copy Stops & TripActivities
        List<Stop> originalStops = stopRepository.findByTripIdOrderByOrderIndexAsc(originalTrip.getId());
        List<TripActivity> originalActivities = tripActivityRepository.findByTripId(originalTrip.getId());

        for (Stop origStop : originalStops) {
            Stop newStop = new Stop();
            newStop.setTrip(savedTrip);
            newStop.setCity(origStop.getCity());
            newStop.setStartDate(origStop.getStartDate());
            newStop.setEndDate(origStop.getEndDate());
            newStop.setOrderIndex(origStop.getOrderIndex());
            newStop.setTransportCost(origStop.getTransportCost());
            newStop.setAccommodationCost(origStop.getAccommodationCost());

            Stop savedStop = stopRepository.save(newStop);

            List<TripActivity> stopActs = originalActivities.stream()
                    .filter(ta -> ta.getStop().getId().equals(origStop.getId()))
                    .toList();

            for (TripActivity origAct : stopActs) {
                TripActivity newAct = new TripActivity();
                newAct.setStop(savedStop);
                newAct.setActivity(origAct.getActivity());
                newAct.setDayDate(origAct.getDayDate());
                newAct.setStartTime(origAct.getStartTime());
                newAct.setCost(origAct.getCost());
                newAct.setNotes(origAct.getNotes());

                tripActivityRepository.save(newAct);
            }
        }

        return savedTrip;
    }
}
