-- Maharashtra Trek App Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE trek_category AS ENUM ('fort', 'trek', 'waterfall', 'cave');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Moderate', 'Difficult', 'Expert');
CREATE TYPE risk_level AS ENUM ('Low', 'Moderate', 'High', 'Extreme');
CREATE TYPE network_quality AS ENUM ('Excellent', 'Good', 'Fair', 'Poor', 'No signal');

-- Main treks table (unified table for all categories)
CREATE TABLE treks (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    category trek_category NOT NULL,
    location TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    duration TEXT NOT NULL,
    elevation TEXT,
    description TEXT NOT NULL,
    
    -- Starting point information
    starting_point_name TEXT NOT NULL,
    starting_point_latitude DECIMAL(10, 8) NOT NULL,
    starting_point_longitude DECIMAL(11, 8) NOT NULL,
    starting_point_facilities TEXT[], -- Array of facilities
    starting_point_description TEXT,
    
    -- Network availability (stored as JSONB for flexibility)
    network_availability JSONB,
    
    -- Food and water information (stored as JSONB)
    food_and_water JSONB,
    
    -- Accommodation information (stored as JSONB)
    accommodation JSONB,
    
    -- Permits information (stored as JSONB)
    permits JSONB,
    
    -- Safety information
    safety_risk_level risk_level,
    safety_common_risks TEXT[],
    safety_precautions TEXT[],
    safety_rescue_points TEXT[],
    safety_nearest_hospital JSONB,
    safety_emergency_numbers JSONB,
    
    -- Weather information (stored as JSONB)
    weather JSONB,
    
    -- Trek route information (stored as JSONB)
    trek_route JSONB,
    
    -- How to reach information (stored as JSONB)
    how_to_reach JSONB,
    
    -- Best time to visit
    best_time_to_visit TEXT,
    
    -- Local contacts (stored as JSONB array)
    local_contacts JSONB,
    
    -- Media and metadata
    image_key TEXT,
    images TEXT[], -- Array of image URLs
    videos TEXT[], -- Array of video URLs
    
    -- Location coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- App-specific fields
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_treks_category ON treks(category);
CREATE INDEX idx_treks_difficulty ON treks(difficulty);
CREATE INDEX idx_treks_featured ON treks(featured);
CREATE INDEX idx_treks_location ON treks USING GIN(to_tsvector('english', location));
CREATE INDEX idx_treks_name ON treks USING GIN(to_tsvector('english', name));
CREATE INDEX idx_treks_coordinates ON treks(latitude, longitude);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_treks_updated_at 
    BEFORE UPDATE ON treks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy category-based queries
CREATE VIEW forts AS 
SELECT * FROM treks WHERE category = 'fort';

CREATE VIEW trek_routes AS 
SELECT * FROM treks WHERE category = 'trek';

CREATE VIEW waterfalls AS 
SELECT * FROM treks WHERE category = 'waterfall';

CREATE VIEW caves AS 
SELECT * FROM treks WHERE category = 'cave';

-- Create a view for featured content
CREATE VIEW featured_treks AS 
SELECT * FROM treks WHERE featured = true ORDER BY rating DESC, review_count DESC;

-- Enable Row Level Security (RLS) for public read access
ALTER TABLE treks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Public read access" ON treks
    FOR SELECT USING (true);

-- Optional: Create policy for authenticated insert/update (for admin use)
-- CREATE POLICY "Authenticated insert" ON treks
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated update" ON treks
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a function to search treks
CREATE OR REPLACE FUNCTION search_treks(search_query TEXT, search_category trek_category DEFAULT NULL)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    category trek_category,
    location TEXT,
    difficulty difficulty_level,
    duration TEXT,
    elevation TEXT,
    description TEXT,
    featured BOOLEAN,
    rating DECIMAL(3, 2),
    review_count INTEGER,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.category,
        t.location,
        t.difficulty,
        t.duration,
        t.elevation,
        t.description,
        t.featured,
        t.rating,
        t.review_count,
        ts_rank(
            to_tsvector('english', t.name || ' ' || t.location || ' ' || t.description),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM treks t
    WHERE 
        (search_category IS NULL OR t.category = search_category)
        AND (
            to_tsvector('english', t.name || ' ' || t.location || ' ' || t.description) 
            @@ plainto_tsquery('english', search_query)
        )
    ORDER BY rank DESC, t.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get nearby treks based on coordinates
CREATE OR REPLACE FUNCTION get_nearby_treks(
    user_lat DECIMAL(10, 8), 
    user_lng DECIMAL(11, 8), 
    radius_km INTEGER DEFAULT 50,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    category trek_category,
    location TEXT,
    difficulty difficulty_level,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.category,
        t.location,
        t.difficulty,
        t.latitude,
        t.longitude,
        (
            6371 * acos(
                cos(radians(user_lat)) * 
                cos(radians(t.latitude)) * 
                cos(radians(t.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(t.latitude))
            )
        )::REAL as distance_km
    FROM treks t
    WHERE (
        6371 * acos(
            cos(radians(user_lat)) * 
            cos(radians(t.latitude)) * 
            cos(radians(t.longitude) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(t.latitude))
        )
    ) <= radius_km
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
