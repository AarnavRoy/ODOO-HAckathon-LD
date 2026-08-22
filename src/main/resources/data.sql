-- Cities
INSERT INTO cities (id, name, country, region, cost_index, popularity_score, image_url) VALUES 
(1, 'Paris', 'France', 'Europe', 8.5, 9.8, 'https://example.com/paris.jpg'),
(2, 'Tokyo', 'Japan', 'Asia', 7.5, 9.9, 'https://example.com/tokyo.jpg'),
(3, 'New York', 'USA', 'North America', 9.5, 9.5, 'https://example.com/nyc.jpg'),
(4, 'Rome', 'Italy', 'Europe', 7.0, 9.2, 'https://example.com/rome.jpg'),
(5, 'Cape Town', 'South Africa', 'Africa', 5.5, 8.5, 'https://example.com/capetown.jpg'),
(6, 'Sydney', 'Australia', 'Oceania', 8.0, 8.8, 'https://example.com/sydney.jpg');

-- Activities for Paris (id=1)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(1, 'Eiffel Tower Tour', 'SIGHTSEEING', 30.00, 120, 'Visit the top of the Eiffel Tower.', 'https://example.com/eiffel.jpg'),
(2, 'Louvre Museum', 'CULTURE', 20.00, 180, 'Explore world-famous art.', 'https://example.com/louvre.jpg'),
(3, 'Seine River Cruise', 'RELAXATION', 15.00, 60, 'Relaxing boat ride.', 'https://example.com/seine.jpg');

-- Activities for Tokyo (id=2)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(2, 'Sushi Making Class', 'FOOD', 80.00, 120, 'Learn to make sushi.', 'https://example.com/sushi.jpg'),
(2, 'Mount Fuji Day Trip', 'ADVENTURE', 100.00, 600, 'Hiking near Mount Fuji.', 'https://example.com/fuji.jpg'),
(2, 'Meiji Shrine Visit', 'CULTURE', 0.00, 90, 'Peaceful shrine in the city.', 'https://example.com/meiji.jpg');

-- Activities for New York (id=3)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(3, 'Statue of Liberty', 'SIGHTSEEING', 25.00, 180, 'Ferry and tour.', 'https://example.com/liberty.jpg'),
(3, 'Broadway Show', 'CULTURE', 150.00, 150, 'Enjoy a top-tier musical.', 'https://example.com/broadway.jpg'),
(3, 'Central Park Bike Ride', 'RELAXATION', 15.00, 120, 'Cycle through the park.', 'https://example.com/centralpark.jpg');

-- Activities for Rome (id=4)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(4, 'Colosseum Tour', 'SIGHTSEEING', 35.00, 150, 'Ancient gladiator arena.', 'https://example.com/colosseum.jpg'),
(4, 'Vatican Museums', 'CULTURE', 30.00, 240, 'Sistine Chapel and more.', 'https://example.com/vatican.jpg'),
(4, 'Pasta Cooking Class', 'FOOD', 65.00, 180, 'Authentic Italian cooking.', 'https://example.com/pasta.jpg');

-- Activities for Cape Town (id=5)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(5, 'Table Mountain Cable Car', 'SIGHTSEEING', 22.00, 120, 'Views from the top.', 'https://example.com/tablemountain.jpg'),
(5, 'Shark Cage Diving', 'ADVENTURE', 120.00, 240, 'Thrilling shark encounter.', 'https://example.com/shark.jpg');

-- Activities for Sydney (id=6)
INSERT INTO activities (city_id, name, category, cost, duration_minutes, description, image_url) VALUES 
(6, 'Sydney Opera House Tour', 'CULTURE', 28.00, 90, 'Inside the iconic building.', 'https://example.com/operahouse.jpg'),
(6, 'Bondi Beach Surfing', 'ADVENTURE', 40.00, 120, 'Learn to surf.', 'https://example.com/bondi.jpg');
