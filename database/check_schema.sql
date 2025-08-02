-- Check Database Schema
-- Run this query in your Supabase SQL Editor to see which columns exist in your treks table

-- Check the structure of the treks table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'treks' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if safety column exists (JSONB version)
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'treks' 
        AND column_name = 'safety'
        AND table_schema = 'public'
) as has_safety_jsonb_column;

-- Check if separate safety columns exist
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'treks' 
        AND column_name = 'safety_risk_level'
        AND table_schema = 'public'
) as has_separate_safety_columns;

-- Show sample of existing data (if any)
SELECT COUNT(*) as existing_records FROM treks;

-- If you have existing data, show a sample
SELECT id, name, category, difficulty 
FROM treks 
LIMIT 5;
