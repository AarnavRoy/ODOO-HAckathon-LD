package com.globetrotter.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "trip_activities")
public class TripActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stop_id", nullable = false)
    private Stop stop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    private LocalDate dayDate;
    private LocalTime startTime;
    
    private Double cost;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Stop getStop() { return stop; }
    public void setStop(Stop stop) { this.stop = stop; }
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
    public LocalDate getDayDate() { return dayDate; }
    public void setDayDate(LocalDate dayDate) { this.dayDate = dayDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
