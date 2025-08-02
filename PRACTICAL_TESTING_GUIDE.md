# Practical Supabase Integration Testing Guide

## Step 1: Set Up Database Schema

1. **Go to your Supabase Dashboard**
   - Visit: https://wolutylrocgyovstiglu.supabase.co
   - Navigate to SQL Editor

2. **Create the Database Schema**
   - Copy the entire content from `database/schema.sql`
   - Paste it in the SQL Editor
   - Click "Run" to execute

## Step 2: Migrate Your Data

Run the migration script to populate your database:

```bash
npm run migrate-supabase
```

If you get any errors, run with validation:

```bash
npm run validate-supabase
```

## Step 3: Practical Testing Steps

### Test 1: Check Data in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to "Table Editor"
3. Select the "treks" table
4. You should see all your trek data

### Test 2: Test in Your App

Add this test component to any screen to verify the integration:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import SupabaseService from '../services/SupabaseService';

const QuickTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const allTreks = await SupabaseService.getAllTreks(true);
      setData(allTreks);
      console.log('✅ Got treks:', allTreks.length);
    } catch (error) {
      console.error('❌ Error:', error);
      setData({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Supabase" onPress={testConnection} />
      {loading && <Text>Loading...</Text>}
      {data && (
        <ScrollView style={{ maxHeight: 200 }}>
          <Text>{JSON.stringify(data, null, 2)}</Text>
        </ScrollView>
      )}
    </View>
  );
};
```

### Test 3: Test Different Categories

```javascript
const testCategories = async () => {
  const forts = await SupabaseService.getTreksByCategory('fort');
  const waterfalls = await SupabaseService.getTreksByCategory('waterfall');
  const caves = await SupabaseService.getTreksByCategory('cave');
  const treks = await SupabaseService.getTreksByCategory('trek');
  
  console.log('Forts:', forts.length);
  console.log('Waterfalls:', waterfalls.length);
  console.log('Caves:', caves.length);
  console.log('Treks:', treks.length);
};
```

### Test 4: Test Search Functionality

```javascript
const testSearch = async () => {
  const results = await SupabaseService.searchTreks('Raigad');
  console.log('Search results for "Raigad":', results.length);
};
```

### Test 5: Test Nearby Treks

```javascript
const testNearby = async () => {
  // Mumbai coordinates
  const nearby = await SupabaseService.getNearbyTreks(19.0760, 72.8777, 100, 5);
  console.log('Nearby treks from Mumbai:', nearby.length);
};
```

## Step 4: Add New Trek Data to Test Dynamic Updates

### Method 1: Through Supabase Dashboard

1. Go to Table Editor → treks table
2. Click "Insert" → "Insert row"
3. Add a new trek with these required fields:
   ```json
   {
     "id": 999,
     "name": "Test Trek",
     "category": "trek",
     "location": "Test Location",
     "difficulty": "Easy",
     "duration": "2-3 hours",
     "description": "This is a test trek",
     "starting_point_name": "Test Village",
     "starting_point_latitude": 18.5204,
     "starting_point_longitude": 73.8567,
     "latitude": 18.5204,
     "longitude": 73.8567,
     "featured": false,
     "rating": 4.0,
     "review_count": 10
   }
   ```

### Method 2: Using SQL Insert

In Supabase SQL Editor, run:

```sql
INSERT INTO treks (
  id, name, category, location, difficulty, duration, description,
  starting_point_name, starting_point_latitude, starting_point_longitude,
  latitude, longitude, featured, rating, review_count
) VALUES (
  999, 'Test Trek', 'trek', 'Test Location', 'Easy', '2-3 hours', 
  'This is a test trek for Supabase integration',
  'Test Village', 18.5204, 73.8567, 18.5204, 73.8567, 
  false, 4.0, 10
);
```

## Step 5: Verify Dynamic Updates

1. **Clear app cache** (force refresh):
   ```javascript
   await SupabaseService.clearCache();
   ```

2. **Fetch fresh data**:
   ```javascript
   const freshData = await SupabaseService.getAllTreks(true);
   ```

3. **Check if your new trek appears** in the app

## Step 6: Test Offline Functionality

1. **Turn off WiFi/Mobile data**
2. **Open your app** - it should still work with cached data
3. **Turn network back on** - app should sync automatically

## Common Issues and Solutions

### Issue: "No rows returned"
**Solution**: Your database is empty. Run the migration script.

### Issue: Migration fails
**Solution**: 
1. Check if schema is properly set up
2. Verify environment variables
3. Check network connection

### Issue: App crashes when using Supabase
**Solution**:
1. Ensure all imports are correct
2. Check if SupabaseService is properly initialized
3. Verify fallback data is available

### Issue: Data not updating
**Solution**:
1. Clear cache: `SupabaseService.clearCache()`
2. Force refresh: `getAllTreks(true)`
3. Check network connection

## Debug Commands

```bash
# Test connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('treks').select('count').then(console.log);
"

# Check migration
npm run validate-supabase

# Re-run migration
npm run migrate-supabase
```

## Success Indicators

✅ **Database has data**: Check Supabase dashboard shows trek records  
✅ **App loads data**: Your app displays treks from Supabase  
✅ **Search works**: Search functionality returns results  
✅ **Categories work**: Different categories show appropriate treks  
✅ **Offline works**: App works without internet using cached data  
✅ **Dynamic updates**: New data added to Supabase appears in app  

Once all these tests pass, your Supabase integration is working correctly!
