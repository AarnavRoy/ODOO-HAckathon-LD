package com.globetrotter.repository;

import com.globetrotter.model.Stop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StopRepository extends JpaRepository<Stop, Long> {
    List<Stop> findByTripId(Long tripId);
    List<Stop> findByTripIdOrderByOrderIndexAsc(Long tripId);
}
