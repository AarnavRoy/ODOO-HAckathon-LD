package com.globetrotter.model;

import jakarta.persistence.*;

@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String name;

    @Enumerated(EnumType.STRING)
    private ActivityCategory category;

    private Double cost;
    private Integer durationMinutes;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String imageUrl;

    public enum ActivityCategory {
        SIGHTSEEING, FOOD, ADVENTURE, CULTURE, RELAXATION, OTHER
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ActivityCategory getCategory() { return category; }
    public void setCategory(ActivityCategory category) { this.category = category; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
