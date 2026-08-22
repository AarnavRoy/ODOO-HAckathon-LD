package com.globetrotter.repository;

import com.globetrotter.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByCityId(Long cityId);

    @Query("SELECT a FROM Activity a WHERE a.city.id = :cityId AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:maxCost IS NULL OR a.cost <= :maxCost) AND " +
           "(:maxDuration IS NULL OR a.durationMinutes <= :maxDuration)")
    List<Activity> findFilteredActivities(@Param("cityId") Long cityId,
                                         @Param("category") Activity.ActivityCategory category,
                                         @Param("maxCost") Double maxCost,
                                         @Param("maxDuration") Integer maxDuration);
}
