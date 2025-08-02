-- Add missing safety columns to the treks table
ALTER TABLE treks 
ADD COLUMN IF NOT EXISTS safety_risk_level TEXT,
ADD COLUMN IF NOT EXISTS safety_common_risks TEXT[],
ADD COLUMN IF NOT EXISTS safety_precautions TEXT[],
ADD COLUMN IF NOT EXISTS safety_rescue_points TEXT[],
ADD COLUMN IF NOT EXISTS safety_nearest_hospital JSONB,
ADD COLUMN IF NOT EXISTS safety_emergency_numbers JSONB;