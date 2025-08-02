# Supabase Integration Guide

This document provides a comprehensive guide for setting up and using the Supabase integration in the Maharashtra Trek App.

## Overview

The app has been migrated from local JSON data storage to Supabase database for dynamic data management. This allows for:

- Real-time data updates without app releases
- Better data management and scalability
- Advanced search and filtering capabilities
- Location-based queries for nearby treks
- Offline caching with automatic sync

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Note down your project URL and anon key from the project settings

### 2. Set up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Run the SQL to create tables, indexes, and functions

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Migrate Data

Run the migration script to populate your database:

```bash
npm run migrate-supabase
```

This will:
- Read all JSON files from the data folders
- Transform the data to match the database schema
- Insert all records into the Supabase database

## Database Schema

### Main Table: `treks`

The unified `treks` table stores all trek data with the following key fields:

- **Basic Info**: `id`, `name`, `category`, `location`, `difficulty`, `duration`, `elevation`
- **Coordinates**: `latitude`, `longitude`, `starting_point_latitude`, `starting_point_longitude`
- **Complex Data**: Stored as JSONB for flexibility
  - `network_availability`
  - `food_and_water`
  - `accommodation`
  - `permits`
  - `weather`
  - `trek_route`
  - `how_to_reach`
  - `local_contacts`
- **Safety**: `safety_risk_level`, `safety_common_risks`, `safety_precautions`
- **Media**: `images[]`, `videos[]`, `image_key`
- **App Features**: `featured`, `rating`, `review_count`

### Views

- `forts`: Filtered view for fort category
- `trek_routes`: Filtered view for trek category  
- `waterfalls`: Filtered view for waterfall category
- `caves`: Filtered view for cave category
- `featured_treks`: Featured content ordered by rating

### Functions

- `search_treks(query, category)`: Full-text search with ranking
- `get_nearby_treks(lat, lng, radius, limit)`: Location-based queries

## Service Architecture

### SupabaseService

The `SupabaseService` class provides:

- **Data Fetching**: All CRUD operations with the database
- **Caching**: Automatic caching with configurable duration
- **Fallback**: Local JSON fallback when Supabase is unavailable
- **Error Handling**: Graceful error handling and logging

### Key Methods

```javascript
// Get all treks
const treks = await SupabaseService.getAllTreks();

// Get by category
const forts = await SupabaseService.getTreksByCategory('fort');

// Search treks
const results = await SupabaseService.searchTreks('Raigad', 'fort');

// Get nearby treks
const nearby = await SupabaseService.getNearbyTreks(18.2311, 73.4143, 50, 10);

// Get by difficulty
const moderate = await SupabaseService.getTreksByDifficulty('Moderate');
```

## React Hooks

### Updated Hooks

All existing hooks have been updated to use SupabaseService:

- `useAllTreks()`: Get all trek data
- `useFeaturedTreks()`: Get featured treks
- `useTreksByCategory(category)`: Get treks by category
- `useSearchTreks()`: Search functionality
- `useDataMetadata()`: Get data statistics

### New Hooks

- `useNearbyTreks(lat, lng, radius, limit)`: Location-based trek discovery

## Caching Strategy

### Cache Keys

- `supabase_all_data`: All treks data
- `supabase_forts`: Fort category data
- `supabase_treks`: Trek category data
- `supabase_waterfalls`: Waterfall category data
- `supabase_caves`: Cave category data
- `supabase_featured`: Featured treks
- `supabase_metadata`: Data statistics

### Cache Duration

- Default: 24 hours
- Configurable via `SUPABASE_CONFIG.CACHE_DURATION`

### Cache Management

```javascript
// Clear all cache
await SupabaseService.clearCache();

// Force refresh (bypasses cache)
const freshData = await SupabaseService.getAllTreks(true);
```

## Offline Support

The app maintains offline functionality through:

1. **Local Fallback**: Original JSON files as backup
2. **Cached Data**: Previously fetched data stored locally
3. **Graceful Degradation**: Automatic fallback when network unavailable

## Performance Optimizations

### Database Indexes

- Category-based queries: `idx_treks_category`
- Difficulty filtering: `idx_treks_difficulty`
- Featured content: `idx_treks_featured`
- Full-text search: `idx_treks_name`, `idx_treks_location`
- Geospatial queries: `idx_treks_coordinates`

### Query Optimizations

- Batch operations for data migration
- Efficient pagination support
- Optimized search with ranking
- Location-based queries using PostGIS functions

## Security

### Row Level Security (RLS)

- Public read access for all trek data
- No authentication required for basic operations
- Optional authenticated access for admin operations

### Data Validation

- Enum types for consistent data
- Required field constraints
- Coordinate validation

## Monitoring and Debugging

### Logging

The service provides comprehensive logging:

```javascript
// Enable debug mode
EXPO_PUBLIC_SUPABASE_DEBUG=true
```

### Error Handling

- Graceful fallback to local data
- Detailed error messages
- Automatic retry mechanisms

## Migration Checklist

- [ ] Create Supabase project
- [ ] Set up database schema
- [ ] Configure environment variables
- [ ] Run data migration script
- [ ] Test all app functionality
- [ ] Verify offline fallback works
- [ ] Monitor performance and errors

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check environment variables and network
2. **Migration Errors**: Verify database schema is properly set up
3. **Cache Issues**: Clear cache and restart app
4. **Fallback Not Working**: Ensure local JSON files are present

### Debug Commands

```bash
# Test migration without inserting data
node scripts/migrateToSupabase.js --dry-run

# Clear all cached data
# (Use app's clear cache function)

# Validate data integrity
npm run validate-data
```

## Future Enhancements

- Real-time data sync with Supabase subscriptions
- User-generated content (reviews, photos)
- Admin dashboard for data management
- Analytics and usage tracking
- Push notifications for new treks
