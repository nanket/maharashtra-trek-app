-- Insert sample data into existing treks table
-- Copy and paste this in your Supabase SQL Editor

-- Clear existing data first (optional)
-- DELETE FROM treks;

-- Insert sample treks for testing
INSERT INTO treks (
    id, name, category, location, difficulty, duration, elevation, description,
    starting_point_name, starting_point_latitude, starting_point_longitude,
    starting_point_facilities, starting_point_description,
    latitude, longitude, featured, rating, review_count,
    images, best_time_to_visit
) VALUES 
(
    1, 'Raigad Fort', 'fort', 'Raigad District', 'Moderate', '5-6 hours', '820 meters',
    'Historic fort and capital of Maratha Empire under Chhatrapati Shivaji Maharaj.',
    'Raigad Peth', 18.2311, 73.4143,
    ARRAY['Parking', 'Restaurants', 'Ropeway'], 'Base village with facilities',
    18.2311, 73.4143, true, 4.8, 450,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/raigad_dae0q5.jpg'],
    'November to February'
),
(
    2, 'Sinhagad Fort', 'fort', 'Pune District', 'Easy', '3-4 hours', '1312 meters',
    'Popular fort near Pune known for its historical significance and scenic beauty.',
    'Sinhagad Base', 18.3664, 73.7556,
    ARRAY['Parking', 'Food stalls', 'Restrooms'], 'Well-developed base with facilities',
    18.3664, 73.7556, true, 4.5, 320,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/sinhagad_example.jpg'],
    'October to March'
),
(
    3, 'Bhimashankar Waterfall', 'waterfall', 'Pune District', 'Easy', '2-3 hours', '1033 meters',
    'Beautiful waterfall near the famous Bhimashankar temple.',
    'Bhimashankar Temple', 19.0728, 73.5347,
    ARRAY['Temple facilities', 'Parking', 'Food'], 'Temple complex with facilities',
    19.0728, 73.5347, false, 4.2, 180,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/bhimashankar_waterfall.jpg'],
    'June to September'
),
(
    4, 'Karla Caves', 'cave', 'Pune District', 'Easy', '2-3 hours', '550 meters',
    'Ancient Buddhist rock-cut caves dating back to 2nd century BCE.',
    'Karla Caves Parking', 18.7608, 73.4856,
    ARRAY['Large parking area', 'Restaurants', 'Souvenir shops'], 'Well-developed tourist area',
    18.7608, 73.4856, true, 4.1, 678,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/karla_caves.jpg'],
    'October to March'
),
(
    5, 'Kalsubai Peak', 'trek', 'Ahmednagar District', 'Moderate', '6-8 hours', '1646 meters',
    'Highest peak in Maharashtra, offering panoramic views of the Western Ghats.',
    'Bari Village', 19.5961, 73.7081,
    ARRAY['Basic parking', 'Local guides', 'Tea stalls'], 'Small village at base',
    19.5961, 73.7081, true, 4.6, 520,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/kalsubai.jpg'],
    'October to February'
),
(
    6, 'Lohagad Fort', 'fort', 'Pune District', 'Easy', '3-4 hours', '1033 meters',
    'Historic hill fort with stunning monsoon views and ancient architecture.',
    'Lohagadwadi Village', 18.7108, 73.4856,
    ARRAY['Parking', 'Local guides', 'Tea stalls'], 'Village at the base with basic facilities',
    18.7108, 73.4856, false, 4.3, 280,
    ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/lohagad.jpg'],
    'October to March'
);

-- Verify the data was inserted
SELECT 
    id, name, category, difficulty, featured, rating,
    starting_point_name, best_time_to_visit
FROM treks 
ORDER BY id;
