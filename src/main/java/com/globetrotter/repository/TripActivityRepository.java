package com.globetrotter.repository; 
import com.globetrotter.model.TripActivity; 
import org.springframework.data.jpa.repository.JpaRepository; 

public interface TripActivityRepository extends JpaRepository<TripActivity, Long> {}
