/**
 * Supabase Configuration
 * 
 * This file contains configuration for the Supabase client.
 * Make sure to set up your environment variables in your .env file or Expo configuration.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Disable auth for this use case since we're only reading public data
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  realtime: {
    // Enable realtime for live data updates (optional)
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names
export const TABLES = {
  FORTS: 'forts',
  TREKS: 'treks', 
  WATERFALLS: 'waterfalls',
  CAVES: 'caves',
};

// Configuration for data fetching
export const SUPABASE_CONFIG = {
  // Cache duration in milliseconds (24 hours)
  CACHE_DURATION: 24 * 60 * 60 * 1000,
  
  // Request timeout in milliseconds (30 seconds)
  REQUEST_TIMEOUT: 30000,
  
  // Enable local fallback when Supabase is unavailable
  USE_LOCAL_FALLBACK: true,
  
  // Batch size for data operations
  BATCH_SIZE: 100,
  
  // Cache keys for AsyncStorage
  CACHE_KEYS: {
    FORTS: 'supabase_forts',
    TREKS: 'supabase_treks',
    WATERFALLS: 'supabase_waterfalls',
    CAVES: 'supabase_caves',
    ALL_DATA: 'supabase_all_data',
    FEATURED: 'supabase_featured',
    METADATA: 'supabase_metadata',
    LAST_SYNC: 'supabase_last_sync',
  },
};

// Validate configuration
export const validateSupabaseConfig = () => {
  const isValid = SUPABASE_URL && 
                  SUPABASE_ANON_KEY && 
                  SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
                  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
  
  if (!isValid) {
    console.warn('⚠️ Supabase configuration not properly set. Please check your environment variables.');
    return false;
  }
  
  return true;
};

// Test connection to Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('forts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error.message);
    return false;
  }
};

export default supabase;
