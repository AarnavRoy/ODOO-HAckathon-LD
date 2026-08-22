package com.globetrotter.loader;

import com.globetrotter.model.Activity;
import com.globetrotter.model.City;
import com.globetrotter.repository.ActivityRepository;
import com.globetrotter.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Override
    public void run(String... args) throws Exception {
        if (cityRepository.count() == 0) {
            City paris = createCity("Paris", "France", "Europe", 8.5, 9.8, "https://images.unsplash.com/photo-1502602898657-3e91760cbb34");
            City tokyo = createCity("Tokyo", "Japan", "Asia", 7.5, 9.9, "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf");
            City nyc = createCity("New York", "USA", "North America", 9.5, 9.5, "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9");
            City rome = createCity("Rome", "Italy", "Europe", 7.0, 9.2, "https://images.unsplash.com/photo-1552832230-c0197dd311b5");
            City capeTown = createCity("Cape Town", "South Africa", "Africa", 5.5, 8.5, "https://images.unsplash.com/photo-1580618672591-eb180b1a973f");
            City sydney = createCity("Sydney", "Australia", "Oceania", 8.0, 8.8, "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9");

            List<City> cities = cityRepository.saveAll(Arrays.asList(paris, tokyo, nyc, rome, capeTown, sydney));

            // Paris Activities
            createActivity(cities.get(0), "Eiffel Tower Tour", Activity.ActivityCategory.SIGHTSEEING, 30.0, 120, "Visit the top of the Eiffel Tower.", "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f");
            createActivity(cities.get(0), "Louvre Museum", Activity.ActivityCategory.CULTURE, 20.0, 180, "Explore world-famous art and history.", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a");
            createActivity(cities.get(0), "Seine River Cruise", Activity.ActivityCategory.RELAXATION, 15.0, 60, "Relaxing boat ride through central Paris.", "https://images.unsplash.com/photo-1543349689-9a4d426bee8e");
            createActivity(cities.get(0), "French Bakery & Pastry Tour", Activity.ActivityCategory.FOOD, 45.0, 90, "Taste authentic croissants, macarons, and baguettes.", "https://images.unsplash.com/photo-1509440159596-0249088772ff");

            // Tokyo Activities
            createActivity(cities.get(1), "Sushi Making Class", Activity.ActivityCategory.FOOD, 80.0, 120, "Learn to make authentic sushi with a master chef.", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c");
            createActivity(cities.get(1), "Mount Fuji Day Trip", Activity.ActivityCategory.ADVENTURE, 100.0, 600, "Hiking and sightseeing near Mount Fuji.", "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65");
            createActivity(cities.get(1), "Meiji Shrine Visit", Activity.ActivityCategory.CULTURE, 0.0, 90, "Peaceful traditional Shinto shrine in Tokyo.", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26");

            // New York Activities
            createActivity(cities.get(2), "Statue of Liberty & Ellis Island", Activity.ActivityCategory.SIGHTSEEING, 25.0, 180, "Ferry ride and historic island tour.", "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a");
            createActivity(cities.get(2), "Broadway Show", Activity.ActivityCategory.CULTURE, 150.0, 150, "Enjoy a top-tier Broadway musical performance.", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7");
            createActivity(cities.get(2), "Central Park Bike Ride", Activity.ActivityCategory.RELAXATION, 15.0, 120, "Cycle through the scenic paths of Central Park.", "https://images.unsplash.com/photo-1518391846015-55a9cc003b25");

            // Rome Activities
            createActivity(cities.get(3), "Colosseum & Roman Forum", Activity.ActivityCategory.SIGHTSEEING, 35.0, 150, "Explore the iconic ancient arena.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5");
            createActivity(cities.get(3), "Vatican Museums & Sistine Chapel", Activity.ActivityCategory.CULTURE, 30.0, 240, "Marvel at Renaissance masterpieces.", "https://images.unsplash.com/photo-1531572753322-ad063cecc140");
            createActivity(cities.get(3), "Pasta & Gelato Cooking Class", Activity.ActivityCategory.FOOD, 65.0, 180, "Hands-on authentic Italian culinary experience.", "https://images.unsplash.com/photo-1551183053-bf91a1d81141");

            // Cape Town Activities
            createActivity(cities.get(4), "Table Mountain Cableway", Activity.ActivityCategory.SIGHTSEEING, 22.0, 120, "Panoramic views of the Cape Peninsula.", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f");
            createActivity(cities.get(4), "Shark Cage Diving Adventure", Activity.ActivityCategory.ADVENTURE, 120.0, 240, "Thrilling great white shark encounter.", "https://images.unsplash.com/photo-1560275619-4662e36fa65c");

            // Sydney Activities
            createActivity(cities.get(5), "Sydney Opera House Guided Tour", Activity.ActivityCategory.CULTURE, 28.0, 90, "Discover stories behind the world-famous sails.", "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be");
            createActivity(cities.get(5), "Bondi Beach Surfing Lesson", Activity.ActivityCategory.ADVENTURE, 40.0, 120, "Learn to ride the waves on Bondi Beach.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e");
        }
    }

    private City createCity(String name, String country, String region, Double costIndex, Double popularityScore, String imageUrl) {
        City city = new City();
        city.setName(name);
        city.setCountry(country);
        city.setRegion(region);
        city.setCostIndex(costIndex);
        city.setPopularityScore(popularityScore);
        city.setImageUrl(imageUrl);
        return city;
    }

    private void createActivity(City city, String name, Activity.ActivityCategory category, Double cost, Integer durationMinutes, String description, String imageUrl) {
        Activity activity = new Activity();
        activity.setCity(city);
        activity.setName(name);
        activity.setCategory(category);
        activity.setCost(cost);
        activity.setDurationMinutes(durationMinutes);
        activity.setDescription(description);
        activity.setImageUrl(imageUrl);
        activityRepository.save(activity);
    }
}
