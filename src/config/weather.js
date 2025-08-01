/**
 * Weather API Configuration - Open-Meteo
 *
 * Open-Meteo is a free, open-source weather API that provides:
 * - No API key required
 * - No registration needed
 * - High-resolution weather data from national weather services
 * - Up to 16-day forecasts
 * - Real-time updates every hour
 * - Perfect for trekking applications
 */

// Open-Meteo API configuration - completely free!
export const WEATHER_CONFIG = {
  BASE_URL: 'https://api.open-meteo.com/v1',
  UNITS: 'metric', // Celsius temperature
  TIMEZONE: 'Asia/Kolkata', // Indian Standard Time for Maharashtra
  FORECAST_DAYS: 7, // Can be extended up to 16 days
};

// For development/testing, you can use demo mode
export const DEMO_MODE = false; // Set to true to use location-based demo data instead of real API

// Weather variable mappings for Open-Meteo API
export const WEATHER_VARIABLES = {
  CURRENT: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m'
  ],
  HOURLY: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'pressure_msl',
    'cloud_cover',
    'visibility',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m'
  ],
  DAILY: [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant'
  ]
};

// Demo weather data for testing (when DEMO_MODE is true)
export const DEMO_WEATHER_DATA = {
  current: {
    temperature: 28,
    feelsLike: 32,
    humidity: 65,
    pressure: 1013,
    visibility: 10,
    windSpeed: 12,
    windDirection: 180,
    description: 'partly cloudy',
    main: 'Clouds',
    icon: '02d',
    cloudiness: 40,
    sunrise: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sunset: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    location: 'Rajgad Fort Area',
    timestamp: new Date(),
  },
  forecast: {
    location: 'Rajgad Fort Area',
    forecast: [
      {
        date: new Date(),
        minTemp: 22,
        maxTemp: 30,
        avgHumidity: 60,
        avgWindSpeed: 10,
        precipitation: 0,
        condition: { main: 'Clear', description: 'clear sky', icon: '01d' },
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        minTemp: 24,
        maxTemp: 32,
        avgHumidity: 65,
        avgWindSpeed: 15,
        precipitation: 2.5,
        condition: { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      },
      {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        minTemp: 20,
        maxTemp: 28,
        avgHumidity: 80,
        avgWindSpeed: 8,
        precipitation: 12.5,
        condition: { main: 'Rain', description: 'light rain', icon: '10d' },
      },
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        minTemp: 18,
        maxTemp: 25,
        avgHumidity: 85,
        avgWindSpeed: 20,
        precipitation: 25.0,
        condition: { main: 'Rain', description: 'moderate rain', icon: '10d' },
      },
      {
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        minTemp: 23,
        maxTemp: 29,
        avgHumidity: 70,
        avgWindSpeed: 12,
        precipitation: 0,
        condition: { main: 'Clear', description: 'clear sky', icon: '01d' },
      },
    ],
    timestamp: new Date(),
  },
};

// WMO Weather Code mappings for Open-Meteo
export const WMO_WEATHER_CODES = {
  0: { main: 'Clear', description: 'Clear sky', icon: '01d' },
  1: { main: 'Clouds', description: 'Mainly clear', icon: '02d' },
  2: { main: 'Clouds', description: 'Partly cloudy', icon: '03d' },
  3: { main: 'Clouds', description: 'Overcast', icon: '04d' },
  45: { main: 'Fog', description: 'Fog', icon: '50d' },
  48: { main: 'Fog', description: 'Depositing rime fog', icon: '50d' },
  51: { main: 'Drizzle', description: 'Light drizzle', icon: '09d' },
  53: { main: 'Drizzle', description: 'Moderate drizzle', icon: '09d' },
  55: { main: 'Drizzle', description: 'Dense drizzle', icon: '09d' },
  56: { main: 'Drizzle', description: 'Light freezing drizzle', icon: '09d' },
  57: { main: 'Drizzle', description: 'Dense freezing drizzle', icon: '09d' },
  61: { main: 'Rain', description: 'Slight rain', icon: '10d' },
  63: { main: 'Rain', description: 'Moderate rain', icon: '10d' },
  65: { main: 'Rain', description: 'Heavy rain', icon: '10d' },
  66: { main: 'Rain', description: 'Light freezing rain', icon: '10d' },
  67: { main: 'Rain', description: 'Heavy freezing rain', icon: '10d' },
  71: { main: 'Snow', description: 'Slight snow fall', icon: '13d' },
  73: { main: 'Snow', description: 'Moderate snow fall', icon: '13d' },
  75: { main: 'Snow', description: 'Heavy snow fall', icon: '13d' },
  77: { main: 'Snow', description: 'Snow grains', icon: '13d' },
  80: { main: 'Rain', description: 'Slight rain showers', icon: '09d' },
  81: { main: 'Rain', description: 'Moderate rain showers', icon: '09d' },
  82: { main: 'Rain', description: 'Violent rain showers', icon: '09d' },
  85: { main: 'Snow', description: 'Slight snow showers', icon: '13d' },
  86: { main: 'Snow', description: 'Heavy snow showers', icon: '13d' },
  95: { main: 'Thunderstorm', description: 'Thunderstorm', icon: '11d' },
  96: { main: 'Thunderstorm', description: 'Thunderstorm with slight hail', icon: '11d' },
  99: { main: 'Thunderstorm', description: 'Thunderstorm with heavy hail', icon: '11d' }
};

/**
 * Open-Meteo API Benefits:
 *
 * ✅ Completely FREE - No API key required
 * ✅ No registration needed - Start using immediately
 * ✅ High accuracy - Uses multiple national weather services
 * ✅ Real-time data - Updated every hour
 * ✅ Up to 16-day forecasts - Better than most free APIs
 * ✅ Location-specific - Perfect for Maharashtra trek locations
 * ✅ Open source - Transparent and reliable
 * ✅ No rate limits for reasonable usage
 * ✅ Comprehensive weather variables
 * ✅ Historical data available (80+ years)
 *
 * Perfect for trekking applications!
 */
