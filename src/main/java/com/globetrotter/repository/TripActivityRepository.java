package com.globetrotter.repository;

import com.globetrotter.model.TripActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripActivityRepository extends JpaRepository<TripActivity, Long> {
    List<TripActivity> findByStopId(Long stopId);

    @Query("SELECT ta FROM TripActivity ta WHERE ta.stop.trip.id = :tripId")
    List<TripActivity> findByTripId(@Param("tripId") Long tripId);
}
