package com.globetrotter.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "stops")
public class Stop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private LocalDate startDate;
    private LocalDate endDate;
    
    private Integer orderIndex;
    
    private Double transportCost;
    private Double accommodationCost;

    // Transport leg TO this stop
    private String transportMode;         // FLIGHT, TRAIN, BUS, CAR, FERRY
    private String departureTerminal;
    private String arrivalTerminal;
    private String departureTime;
    private String arrivalTime;
    private String bookingReference;
    private Double distanceKm;

    // Accommodation at this stop
    private String accommodationName;
    private String accommodationCheckin;
    private String accommodationCheckout;
    private String accommodationBookingRef;
    @Column(columnDefinition = "TEXT")
    private String accommodationNotes;

    // General notes
    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "stop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TripActivity> tripActivities;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }
    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public Double getTransportCost() { return transportCost; }
    public void setTransportCost(Double transportCost) { this.transportCost = transportCost; }
    public Double getAccommodationCost() { return accommodationCost; }
    public void setAccommodationCost(Double accommodationCost) { this.accommodationCost = accommodationCost; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    public String getDepartureTerminal() { return departureTerminal; }
    public void setDepartureTerminal(String departureTerminal) { this.departureTerminal = departureTerminal; }
    public String getArrivalTerminal() { return arrivalTerminal; }
    public void setArrivalTerminal(String arrivalTerminal) { this.arrivalTerminal = arrivalTerminal; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getAccommodationName() { return accommodationName; }
    public void setAccommodationName(String accommodationName) { this.accommodationName = accommodationName; }
    public String getAccommodationCheckin() { return accommodationCheckin; }
    public void setAccommodationCheckin(String accommodationCheckin) { this.accommodationCheckin = accommodationCheckin; }
    public String getAccommodationCheckout() { return accommodationCheckout; }
    public void setAccommodationCheckout(String accommodationCheckout) { this.accommodationCheckout = accommodationCheckout; }
    public String getAccommodationBookingRef() { return accommodationBookingRef; }
    public void setAccommodationBookingRef(String accommodationBookingRef) { this.accommodationBookingRef = accommodationBookingRef; }
    public String getAccommodationNotes() { return accommodationNotes; }
    public void setAccommodationNotes(String accommodationNotes) { this.accommodationNotes = accommodationNotes; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<TripActivity> getTripActivities() { return tripActivities; }
    public void setTripActivities(List<TripActivity> tripActivities) { this.tripActivities = tripActivities; }
}
