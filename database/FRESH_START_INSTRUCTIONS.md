# Fresh Start Instructions for Supabase Database

## Overview
This guide will help you completely reset your Supabase database and start fresh with a clean, working setup for the Maharashtra Trek App with **ALL 32 trek entries**.

## Step-by-Step Process

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Create a new query

### Step 2: Reset Database (Clean Slate)
1. Copy the entire content of `database/fresh_start.sql`
2. Paste it into the Supabase SQL Editor
3. Click **Run** to execute the script

**What this does:**
- Drops all existing tables, views, and functions
- Creates a clean, optimized schema
- Sets up proper indexes and security policies
- Creates utility functions for search and nearby treks

### Step 3: Insert ALL Trek Data
1. Copy the entire content of `database/complete_data_migration.sql`
2. Paste it into a new query in the SQL Editor
3. Click **Run** to execute the script

**What this does:**
- Inserts ALL 32 trek entries from your existing data
- Includes complete data with images, videos, and detailed information
- Covers all categories: 19 forts, 8 waterfalls, 3 treks, 1 peak, 2 caves
- Tests all database functions to ensure everything works

### Step 4: Verify Everything Works
After running both scripts, you should see:

```sql
-- Check data was inserted
SELECT COUNT(*) FROM treks; -- Should return 32

-- Check categories
SELECT category, COUNT(*) FROM treks GROUP BY category;
-- Should show: fort (19), waterfall (8), trek (3), peak (1), cave (2)

-- Test search function
SELECT name, category FROM search_treks('fort');
-- Should return multiple forts like Lohagad, Raigad, Torna, etc.

-- Check featured treks
SELECT name, category FROM treks WHERE featured = true;
-- Should show featured destinations
```

## Database Schema Overview

The new schema uses a **simplified JSONB approach** for complex data:

### Core Fields
- `id`, `name`, `category`, `location`, `difficulty`, `duration`, `elevation`
- `description`, `featured`, `rating`, `review_count`
- `latitude`, `longitude` (for location)
- `images[]`, `videos[]` (media arrays)

### JSONB Fields (Flexible Structure)
- `safety` - All safety information in one JSONB field
- `network_availability` - Network coverage details
- `food_and_water` - Food and water information
- `accommodation` - Stay options
- `permits` - Permit requirements
- `weather` - Weather conditions by season
- `trek_route` - Route details and waypoints
- `how_to_reach` - Transportation from Mumbai/Pune
- `local_contacts` - Guide and emergency contacts

## Key Features

### 1. **Simplified Safety Structure**
Instead of separate columns, safety data is stored as:
```json
{
  "riskLevel": "Low|Moderate|High",
  "commonRisks": ["risk1", "risk2"],
  "precautions": ["precaution1", "precaution2"],
  "rescuePoints": ["point1", "point2"],
  "nearestHospital": {"name": "Hospital", "distance": "10 km"},
  "emergencyNumbers": {"ambulance": "108", "police": "112"}
}
```

### 2. **Built-in Search Function**
```sql
SELECT * FROM search_treks('lohagad');
SELECT * FROM search_treks('fort', 'fort'); -- Search within category
```

### 3. **Nearby Treks Function**
```sql
SELECT * FROM get_nearby_treks(18.7104, 73.4763, 50, 10);
-- (latitude, longitude, radius_km, limit)
```

### 4. **Category Views**
- `forts` - All fort entries
- `trek_routes` - All trek entries  
- `waterfalls` - All waterfall entries
- `caves` - All cave entries
- `featured_treks` - All featured content

## Next Steps After Fresh Start

1. **Test your app** - The database should now work with your existing React Native app
2. **Add more data** - Use the same structure to add more treks
3. **Customize as needed** - Modify the JSONB structures based on your app's needs

## Troubleshooting

### If you get permission errors:
```sql
-- Check if RLS is properly configured
SELECT * FROM pg_policies WHERE tablename = 'treks';
```

### If search doesn't work:
```sql
-- Test the search function directly
SELECT search_treks('test');
```

### If you need to start over again:
Just run `fresh_start.sql` again - it will clean everything and start fresh.

## Files Created
- `database/fresh_start.sql` - Complete database reset and schema creation
- `database/fresh_data_migration.sql` - Sample data insertion
- `database/FRESH_START_INSTRUCTIONS.md` - This instruction file

## Complete Data Overview

Your fresh database will include **ALL 32 trek entries**:

### 🏰 Forts (19 entries)
- Alang Fort, Avchitgad Fort, Harishchandra Gad, Jivdhan Fort, Korigad Fort
- Lohagad Fort, Madan Fort, Peb Fort, Pratapgad Fort, Purandar Fort
- Raigad Fort, Rajgad Fort, Shivneri Fort, Sinhagad Fort, Tikona Fort
- Torna Fort, Vasota Fort, Visapur Fort, and more

### 🏔️ Treks (3 entries)
- Andharban Trek, Bhimashankar Trek, Rajmachi Fort

### ⛰️ Peaks (1 entry)
- Kalsubai Peak (highest peak in Maharashtra)

### 💧 Waterfalls (8 entries)
- Bhimashankar Waterfall, Bhivpuri Waterfall, Kune Waterfall, Lingmala Waterfall
- Bahiri Waterfall, Devkund Waterfall, Nanemachi Waterfall, Pandavkada Waterfall

### 🕳️ Caves (2 entries)
- Bhaja Caves, Karla Caves

## Success Indicators
After completing both steps, you should have:
- ✅ Clean database schema with proper indexes
- ✅ **ALL 32 trek entries** with complete data
- ✅ Working search and nearby trek functions
- ✅ Proper security policies for public read access
- ✅ No more "column does not exist" errors
- ✅ All categories working (forts, treks, peaks, waterfalls, caves)
- ✅ Featured content properly marked
- ✅ Real images, videos, and detailed information

Your Maharashtra Trek App should now work perfectly with the complete database!
