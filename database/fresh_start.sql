-- FRESH START: Complete Supabase Setup for Maharashtra Trek App
-- This script will create everything from scratch
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- STEP 1: Clean up existing data and tables
-- =============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS treks CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS forts CASCADE;
DROP VIEW IF EXISTS trek_routes CASCADE;
DROP VIEW IF EXISTS waterfalls CASCADE;
DROP VIEW IF EXISTS caves CASCADE;
DROP VIEW IF EXISTS featured_treks CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS search_treks(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_nearby_treks(DECIMAL, DECIMAL, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing types if they exist
DROP TYPE IF EXISTS trek_category CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS network_quality CASCADE;

-- =============================================================================
-- STEP 2: Create fresh schema with simplified structure
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE trek_category AS ENUM ('fort', 'trek', 'waterfall', 'cave');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Moderate', 'Difficult', 'Expert');

-- Create the main treks table with simplified structure
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

-- =============================================================================
-- STEP 3: Create indexes for better performance
-- =============================================================================

CREATE INDEX idx_treks_category ON treks(category);
CREATE INDEX idx_treks_difficulty ON treks(difficulty);
CREATE INDEX idx_treks_featured ON treks(featured);
CREATE INDEX idx_treks_location ON treks USING GIN(to_tsvector('english', location));
CREATE INDEX idx_treks_name ON treks USING GIN(to_tsvector('english', name));
CREATE INDEX idx_treks_coordinates ON treks(latitude, longitude);

-- =============================================================================
-- STEP 4: Create utility functions
-- =============================================================================

-- Function to update the updated_at timestamp
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

-- =============================================================================
-- STEP 5: Create views for easy category-based queries
-- =============================================================================

CREATE VIEW forts AS 
SELECT * FROM treks WHERE category = 'fort';

CREATE VIEW trek_routes AS 
SELECT * FROM treks WHERE category = 'trek';

CREATE VIEW waterfalls AS 
SELECT * FROM treks WHERE category = 'waterfall';

CREATE VIEW caves AS 
SELECT * FROM treks WHERE category = 'cave';

CREATE VIEW featured_treks AS 
SELECT * FROM treks WHERE featured = true ORDER BY rating DESC, review_count DESC;

-- =============================================================================
-- STEP 6: Enable Row Level Security and create policies
-- =============================================================================

-- Enable Row Level Security
ALTER TABLE treks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Public read access" ON treks
    FOR SELECT USING (true);

-- Optional: Create policies for authenticated insert/update (for admin use)
-- Uncomment these if you need admin functionality later
-- CREATE POLICY "Authenticated insert" ON treks
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated update" ON treks
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- =============================================================================
-- STEP 7: Create search and utility functions
-- =============================================================================

-- Function to search treks
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

-- Function to get nearby treks based on coordinates
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

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'treks' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show that the table is empty and ready for data
SELECT COUNT(*) as total_records FROM treks;

-- Success message
SELECT 'Database successfully reset and ready for fresh data!' as status;
