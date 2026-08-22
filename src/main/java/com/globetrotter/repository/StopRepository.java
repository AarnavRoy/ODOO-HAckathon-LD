package com.globetrotter.repository; 
import com.globetrotter.model.Stop; 
import org.springframework.data.jpa.repository.JpaRepository; 

public interface StopRepository extends JpaRepository<Stop, Long> {}
