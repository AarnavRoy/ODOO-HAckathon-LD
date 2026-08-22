package com.globetrotter.repository; 
import com.globetrotter.model.Trip; 
import org.springframework.data.jpa.repository.JpaRepository; 
import java.util.Optional; 
import java.util.List; 

public interface TripRepository extends JpaRepository<Trip, Long> { 
    List<Trip> findByUserId(Long userId); 
    Optional<Trip> findByShareToken(String shareToken); 
}
