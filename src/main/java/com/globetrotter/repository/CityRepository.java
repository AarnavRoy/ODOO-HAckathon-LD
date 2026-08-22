package com.globetrotter.repository;

import com.globetrotter.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {

    @Query("SELECT c FROM City c WHERE " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.country) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.region) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:country IS NULL OR LOWER(c.country) LIKE LOWER(CONCAT('%', :country, '%'))) AND " +
           "(:region IS NULL OR LOWER(c.region) LIKE LOWER(CONCAT('%', :region, '%')))")
    List<City> searchCities(@Param("search") String search, 
                            @Param("country") String country, 
                            @Param("region") String region);
}
