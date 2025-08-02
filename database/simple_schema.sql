-- Simple schema for testing Supabase integration
-- Copy and paste this in your Supabase SQL Editor

-- Create the main treks table
CREATE TABLE IF NOT EXISTS treks (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    duration TEXT NOT NULL,
    elevation TEXT,
    description TEXT NOT NULL,
    
    -- Starting point information
    starting_point_name TEXT NOT NULL,
    starting_point_latitude DECIMAL(10, 8) NOT NULL,
    starting_point_longitude DECIMAL(11, 8) NOT NULL,
    starting_point_facilities TEXT[],
    starting_point_description TEXT,
    
    -- Location coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- App-specific fields
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Media
    images TEXT[],
    videos TEXT[],
    image_key TEXT,
    
    -- Other fields
    best_time_to_visit TEXT,
    
    -- Complex data as JSONB (for flexibility)
    network_availability JSONB,
    food_and_water JSONB,
    accommodation JSONB,
    permits JSONB,
    safety JSONB,
    weather JSONB,
    trek_route JSONB,
    how_to_reach JSONB,
    local_contacts JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_treks_category ON treks(category);
CREATE INDEX IF NOT EXISTS idx_treks_difficulty ON treks(difficulty);
CREATE INDEX IF NOT EXISTS idx_treks_featured ON treks(featured);

-- Enable Row Level Security
ALTER TABLE treks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON treks
    FOR SELECT USING (true);

-- Insert sample data for testing
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
);

-- Verify the data was inserted
SELECT 
    id, name, category, difficulty, featured, rating,
    starting_point_name, best_time_to_visit
FROM treks 
ORDER BY id;
