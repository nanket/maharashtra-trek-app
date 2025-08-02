-- Add the missing safety column to match the migration data
ALTER TABLE treks ADD COLUMN IF NOT EXISTS safety JSONB;

-- Now your migration should work