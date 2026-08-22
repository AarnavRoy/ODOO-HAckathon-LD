package com.globetrotter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globetrotter.dto.AuthDto.*;
import com.globetrotter.dto.TripDataDto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class EndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TripActivityRepository tripActivityRepository;

    private String user1Token;
    private String user2Token;
    private User user1;
    private User user2;
    private City paris;
    private City tokyo;
    private Activity eiffelActivity;
    private Activity bakeryActivity;
    private Trip testTrip;
    private Stop testStop;

    @BeforeEach
    public void setup() throws Exception {
        tripActivityRepository.deleteAll();
        stopRepository.deleteAll();
        tripRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create User 1
        SignupRequest signup1 = new SignupRequest("Alice Explorer", "alice_exp", "alice@gmail.com", "Password123!");
        MvcResult res1 = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup1)))
                .andExpect(status().isCreated())
                .andReturn();
        AuthResponse auth1 = objectMapper.readValue(res1.getResponse().getContentAsString(), AuthResponse.class);
        user1Token = auth1.token();
        user1 = userRepository.findByEmail("alice@gmail.com").orElseThrow();

        // 2. Create User 2
        SignupRequest signup2 = new SignupRequest("Bob Traveler", "bob_trav", "bob@gmail.com", "Password123!");
        MvcResult res2 = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup2)))
                .andExpect(status().isCreated())
                .andReturn();
        AuthResponse auth2 = objectMapper.readValue(res2.getResponse().getContentAsString(), AuthResponse.class);
        user2Token = auth2.token();
        user2 = userRepository.findByEmail("bob@gmail.com").orElseThrow();

        // 3. Find cities
        paris = cityRepository.findAll().stream().filter(c -> "Paris".equalsIgnoreCase(c.getName())).findFirst().orElseThrow();
        tokyo = cityRepository.findAll().stream().filter(c -> "Tokyo".equalsIgnoreCase(c.getName())).findFirst().orElseThrow();

        eiffelActivity = activityRepository.findByCityId(paris.getId()).stream()
                .filter(a -> a.getCategory() == Activity.ActivityCategory.SIGHTSEEING)
                .findFirst().orElseThrow();

        bakeryActivity = activityRepository.findByCityId(paris.getId()).stream()
                .filter(a -> a.getCategory() == Activity.ActivityCategory.FOOD)
                .findFirst().orElseThrow();

        // 4. Create Trip for User 1
        testTrip = new Trip();
        testTrip.setUser(user1);
        testTrip.setName("European Summer Tour");
        testTrip.setStartDate(LocalDate.of(2026, 9, 1));
        testTrip.setEndDate(LocalDate.of(2026, 9, 3));
        testTrip.setDescription("A quick 3-day Paris getaway");
        testTrip.setBudgetLimit(300.0); // 100/day
        testTrip = tripRepository.save(testTrip);

        // 5. Create Stop
        testStop = new Stop();
        testStop.setTrip(testTrip);
        testStop.setCity(paris);
        testStop.setStartDate(LocalDate.of(2026, 9, 1));
        testStop.setEndDate(LocalDate.of(2026, 9, 3));
        testStop.setOrderIndex(0);
        testStop.setTransportCost(50.0);
        testStop.setAccommodationCost(120.0);
        testStop = stopRepository.save(testStop);
    }

    @Test
    public void testGetCitiesWithSearchAndFilters() throws Exception {
        // Search by query
        mockMvc.perform(get("/api/cities?search=par"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name", is("Paris")));

        // Filter by country
        mockMvc.perform(get("/api/cities?country=Japan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Tokyo")));

        // Filter by region
        mockMvc.perform(get("/api/cities?region=Europe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    public void testGetCityActivitiesWithFilters() throws Exception {
        // All activities for Paris
        mockMvc.perform(get("/api/cities/" + paris.getId() + "/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));

        // Filter by category FOOD
        mockMvc.perform(get("/api/cities/" + paris.getId() + "/activities?category=FOOD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category", is("FOOD")));

        // Filter by maxCost
        mockMvc.perform(get("/api/cities/" + paris.getId() + "/activities?maxCost=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].cost", everyItem(lessThanOrEqualTo(20.0))));
    }

    @Test
    public void testAddAndDeleteTripActivity() throws Exception {
        TripActivityRequest request = new TripActivityRequest(
                eiffelActivity.getId(),
                LocalDate.of(2026, 9, 1),
                LocalTime.of(10, 0),
                35.0,
                "Book summit access tickets"
        );

        MvcResult result = mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.cost", is(35.0)))
                .andExpect(jsonPath("$.notes", is("Book summit access tickets")))
                .andReturn();

        TripActivity savedTa = objectMapper.readValue(result.getResponse().getContentAsString(), TripActivity.class);

        // Delete trip activity
        mockMvc.perform(delete("/api/trip-activities/" + savedTa.getId())
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));
    }

    @Test
    public void testTripItineraryGrouping() throws Exception {
        // Add activity on Day 1
        TripActivityRequest act1 = new TripActivityRequest(
                eiffelActivity.getId(),
                LocalDate.of(2026, 9, 1),
                LocalTime.of(10, 0),
                30.0,
                "Eiffel Visit"
        );
        mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(act1)))
                .andExpect(status().isCreated());

        // Add activity on Day 2
        TripActivityRequest act2 = new TripActivityRequest(
                bakeryActivity.getId(),
                LocalDate.of(2026, 9, 2),
                LocalTime.of(14, 30),
                45.0,
                "Pastry Tour"
        );
        mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(act2)))
                .andExpect(status().isCreated());

        // Get Itinerary
        mockMvc.perform(get("/api/trips/" + testTrip.getId() + "/itinerary")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days", hasSize(3)))
                .andExpect(jsonPath("$.days[0].date", is("2026-09-01")))
                .andExpect(jsonPath("$.days[0].stops[0].city.name", is("Paris")))
                .andExpect(jsonPath("$.days[0].stops[0].activities[0].name", is("Eiffel Tower Tour")))
                .andExpect(jsonPath("$.days[1].date", is("2026-09-02")))
                .andExpect(jsonPath("$.days[1].stops[0].activities[0].name", is("French Bakery & Pastry Tour")));
    }

    @Test
    public void testTripBudgetCalculation() throws Exception {
        // Non-food activity: 30.0
        TripActivityRequest act1 = new TripActivityRequest(
                eiffelActivity.getId(),
                LocalDate.of(2026, 9, 1),
                LocalTime.of(10, 0),
                30.0,
                null
        );
        mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(act1)))
                .andExpect(status().isCreated());

        // Food activity: 45.0
        TripActivityRequest act2 = new TripActivityRequest(
                bakeryActivity.getId(),
                LocalDate.of(2026, 9, 1),
                LocalTime.of(12, 0),
                45.0,
                null
        );
        mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(act2)))
                .andExpect(status().isCreated());

        // Stop costs: transport = 50.0, stay = 120.0 (3 days -> 40/day)
        // Total expected = 50 (transport) + 120 (stay) + 30 (activities) + 45 (meals) = 245.0
        // Day 1 cost = 30 + 45 + 50 (transport) + 40 (stay) = 165.0
        // BudgetLimit = 300 / 3 days = 100/day -> Day 1 should be overBudget = true!

        mockMvc.perform(get("/api/trips/" + testTrip.getId() + "/budget")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", is(245.0)))
                .andExpect(jsonPath("$.byCategory.transport", is(50.0)))
                .andExpect(jsonPath("$.byCategory.stay", is(120.0)))
                .andExpect(jsonPath("$.byCategory.activities", is(30.0)))
                .andExpect(jsonPath("$.byCategory.meals", is(45.0)))
                .andExpect(jsonPath("$.byDay[0].date", is("2026-09-01")))
                .andExpect(jsonPath("$.byDay[0].cost", is(165.0)))
                .andExpect(jsonPath("$.byDay[0].overBudget", is(true)))
                .andExpect(jsonPath("$.byDay[1].cost", is(40.0)))
                .andExpect(jsonPath("$.byDay[1].overBudget", is(false)));
    }

    @Test
    public void testTripShareAndDeepCopy() throws Exception {
        // Add an activity to the test trip
        TripActivityRequest act = new TripActivityRequest(
                eiffelActivity.getId(),
                LocalDate.of(2026, 9, 1),
                LocalTime.of(10, 0),
                30.0,
                "Original Note"
        );
        mockMvc.perform(post("/api/stops/" + testStop.getId() + "/activities")
                        .header("Authorization", "Bearer " + user1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(act)))
                .andExpect(status().isCreated());

        // 1. Share the trip
        MvcResult shareResult = mockMvc.perform(post("/api/trips/" + testTrip.getId() + "/share")
                        .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shareToken", notNullValue()))
                .andExpect(jsonPath("$.publicUrl", containsString("/share/")))
                .andReturn();

        ShareResponse shareResponse = objectMapper.readValue(shareResult.getResponse().getContentAsString(), ShareResponse.class);
        String token = shareResponse.shareToken();

        // 2. View shared trip (Public, NO auth required)
        mockMvc.perform(get("/api/public/trips/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("European Summer Tour")))
                .andExpect(jsonPath("$.isPublic", is(true)))
                .andExpect(jsonPath("$.stops", hasSize(1)))
                .andExpect(jsonPath("$.stops[0].activities", hasSize(1)));

        // 3. Copy shared trip (By User 2, auth required)
        MvcResult copyResult = mockMvc.perform(post("/api/public/trips/" + token + "/copy")
                        .header("Authorization", "Bearer " + user2Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Copy of European Summer Tour")))
                .andExpect(jsonPath("$.isPublic", is(false)))
                .andReturn();

        Trip copiedTrip = objectMapper.readValue(copyResult.getResponse().getContentAsString(), Trip.class);

        // Verify deep copy in database
        var copiedStops = stopRepository.findByTripId(copiedTrip.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, copiedStops.size());

        var copiedActs = tripActivityRepository.findByStopId(copiedStops.get(0).getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, copiedActs.size());
        org.junit.jupiter.api.Assertions.assertEquals("Original Note", copiedActs.get(0).getNotes());
    }

    @Test
    public void testAdminStats() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.totalTrips", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.topCities", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.topActivities", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.engagement", notNullValue()));
    }
}
