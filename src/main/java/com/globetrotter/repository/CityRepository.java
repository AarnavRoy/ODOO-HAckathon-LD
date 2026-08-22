package com.globetrotter.repository; 
import com.globetrotter.model.City; 
import org.springframework.data.jpa.repository.JpaRepository; 

public interface CityRepository extends JpaRepository<City, Long> {}
