-- Schema Migration Fix for Maharashtra Trek App
-- This script handles the mismatch between data format and database schema

-- STEP 1: First run check_schema.sql to determine your current schema
-- STEP 2: Based on the results, choose the appropriate solution below

-- =============================================================================
-- SOLUTION A: If your database has separate safety columns (schema.sql structure)
-- =============================================================================

-- Use this if check_schema.sql shows you have columns like:
-- safety_risk_level, safety_common_risks, safety_precautions, etc.

-- Clear existing data (optional)
-- DELETE FROM treks;

-- Sample insert with separate safety columns (add more records as needed)
/*
INSERT INTO treks (
    id, name, category, location, difficulty, duration, elevation, description,
    starting_point_name, starting_point_latitude, starting_point_longitude,
    starting_point_facilities, starting_point_description,
    latitude, longitude, featured, rating, review_count,
    images, videos, image_key, best_time_to_visit,
    network_availability, food_and_water, accommodation, permits,
    safety_risk_level, safety_common_risks, safety_precautions, safety_rescue_points, 
    safety_nearest_hospital, safety_emergency_numbers,
    weather, trek_route, how_to_reach, local_contacts
) VALUES
(2, 'Lohagad Fort', 'fort', 'Pune District, Maharashtra', 'Easy', '2-3 hours', '1,033 meters', 
 'Historic fort with easy access and great views', 'Lohagadwadi Village', 18.7104, 73.4763,
 ARRAY['Parking', 'Food stalls', 'Guides'], 'Main base village with facilities',
 18.7104, 73.4763, true, 4.7, 321,
 ARRAY['https://example.com/image1.jpg'], ARRAY['https://example.com/video1.mp4'], 'lohagad',
 'June to February',
 '{"baseVillage":{"airtel":"Good","jio":"Good"}}'::jsonb,
 '{"atBase":{"restaurants":["Local dhaba"]}}'::jsonb,
 '{"camping":{"allowed":true}}'::jsonb,
 '{"required":false}'::jsonb,
 'Low', -- safety_risk_level
 ARRAY['Slippery steps during monsoon', 'Crowds on weekends'], -- safety_common_risks
 ARRAY['Wear proper shoes', 'Start early'], -- safety_precautions
 ARRAY['Base village', 'Main gate'], -- safety_rescue_points
 '{"name":"Local Hospital","distance":"10 km"}'::jsonb, -- safety_nearest_hospital
 '{"ambulance":"108","police":"112"}'::jsonb, -- safety_emergency_numbers
 '{"monsoon":{"recommendation":"Popular season"}}'::jsonb,
 '{"totalDistance":"5 km"}'::jsonb,
 '{"fromMumbai":{"byTrain":{"distance":"100 km"}}}'::jsonb,
 '[{"name":"Guide","phone":"1234567890"}]'::jsonb
);
*/

-- =============================================================================
-- SOLUTION B: If your database has a single safety JSONB column (simple_schema.sql)
-- =============================================================================

-- Use this if check_schema.sql shows you have a single 'safety' column of type jsonb

-- Add the safety column if it doesn't exist
-- ALTER TABLE treks ADD COLUMN IF NOT EXISTS safety JSONB;

-- Sample insert with single safety JSONB column
/*
INSERT INTO treks (
    id, name, category, location, difficulty, duration, elevation, description,
    starting_point_name, starting_point_latitude, starting_point_longitude,
    starting_point_facilities, starting_point_description,
    latitude, longitude, featured, rating, review_count,
    images, videos, image_key, best_time_to_visit,
    network_availability, food_and_water, accommodation, permits,
    safety, weather, trek_route, how_to_reach, local_contacts
) VALUES
(2, 'Lohagad Fort', 'fort', 'Pune District, Maharashtra', 'Easy', '2-3 hours', '1,033 meters',
 'Historic fort with easy access and great views', 'Lohagadwadi Village', 18.7104, 73.4763,
 ARRAY['Parking', 'Food stalls', 'Guides'], 'Main base village with facilities',
 18.7104, 73.4763, true, 4.7, 321,
 ARRAY['https://example.com/image1.jpg'], ARRAY['https://example.com/video1.mp4'], 'lohagad',
 'June to February',
 '{"baseVillage":{"airtel":"Good","jio":"Good"}}'::jsonb,
 '{"atBase":{"restaurants":["Local dhaba"]}}'::jsonb,
 '{"camping":{"allowed":true}}'::jsonb,
 '{"required":false}'::jsonb,
 '{"riskLevel":"Low","commonRisks":["Slippery steps"],"precautions":["Wear proper shoes"]}'::jsonb,
 '{"monsoon":{"recommendation":"Popular season"}}'::jsonb,
 '{"totalDistance":"5 km"}'::jsonb,
 '{"fromMumbai":{"byTrain":{"distance":"100 km"}}}'::jsonb,
 '[{"name":"Guide","phone":"1234567890"}]'::jsonb
);
*/

-- =============================================================================
-- SOLUTION C: Convert existing schema to use single safety column
-- =============================================================================

-- If you want to convert from separate safety columns to single JSONB column:

-- Step 1: Add the safety JSONB column
-- ALTER TABLE treks ADD COLUMN IF NOT EXISTS safety JSONB;

-- Step 2: Migrate existing data (if any)
/*
UPDATE treks SET safety = jsonb_build_object(
    'riskLevel', safety_risk_level,
    'commonRisks', safety_common_risks,
    'precautions', safety_precautions,
    'rescuePoints', safety_rescue_points,
    'nearestHospital', safety_nearest_hospital,
    'emergencyNumbers', safety_emergency_numbers
) WHERE safety IS NULL;
*/

-- Step 3: Drop old safety columns (optional, be careful!)
/*
ALTER TABLE treks 
DROP COLUMN IF EXISTS safety_risk_level,
DROP COLUMN IF EXISTS safety_common_risks,
DROP COLUMN IF EXISTS safety_precautions,
DROP COLUMN IF EXISTS safety_rescue_points,
DROP COLUMN IF EXISTS safety_nearest_hospital,
DROP COLUMN IF EXISTS safety_emergency_numbers;
*/

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check the final structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'treks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify data was inserted
SELECT id, name, category, difficulty FROM treks ORDER BY id LIMIT 5;

-- Check safety data format
SELECT id, name, 
    CASE 
        WHEN safety IS NOT NULL THEN 'JSONB safety column'
        WHEN safety_risk_level IS NOT NULL THEN 'Separate safety columns'
        ELSE 'No safety data'
    END as safety_format
FROM treks LIMIT 5;
