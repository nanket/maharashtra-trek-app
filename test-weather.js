/**
 * Test script to verify Open-Meteo API integration
 * Run with: node test-weather.js
 */

// Import the weather service
const { WEATHER_CONFIG, WMO_WEATHER_CODES } = require('./src/config/weather');

// Test coordinates for Raigad Fort (popular trek in Maharashtra)
const testCoordinates = {
  latitude: 18.2358,
  longitude: 73.4397,
  name: 'Raigad Fort'
};

// Simple fetch implementation for Node.js
const fetch = require('node-fetch');

class TestWeatherService {
  static async getCurrentWeather(latitude, longitude) {
    try {
      const currentVariables = [
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
      ].join(',');
      
      const url = `${WEATHER_CONFIG.BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentVariables}&timezone=${WEATHER_CONFIG.TIMEZONE}`;
      
      console.log('Fetching weather from:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatOpenMeteoCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  static formatOpenMeteoCurrentWeather(data) {
    const current = data.current;
    const weatherCode = current.weather_code || 0;
    const weatherInfo = WMO_WEATHER_CODES[weatherCode] || WMO_WEATHER_CODES[0];
    
    return {
      temperature: Math.round(current.temperature_2m || 0),
      feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
      humidity: Math.round(current.relative_humidity_2m || 0),
      pressure: Math.round(current.pressure_msl || 1013),
      visibility: 10, // Default 10km visibility for Open-Meteo
      windSpeed: Math.round(current.wind_speed_10m || 0),
      windDirection: Math.round(current.wind_direction_10m || 0),
      description: weatherInfo.description,
      main: weatherInfo.main,
      icon: weatherInfo.icon,
      cloudiness: Math.round(current.cloud_cover || 0),
      sunrise: null,
      sunset: null,
      location: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`,
      timestamp: new Date(),
    };
  }
}

// Run the test
async function testWeatherAPI() {
  console.log('🌦️ Testing Open-Meteo API Integration');
  console.log('=====================================');
  console.log(`Testing location: ${testCoordinates.name}`);
  console.log(`Coordinates: ${testCoordinates.latitude}, ${testCoordinates.longitude}`);
  console.log('');

  try {
    const weather = await TestWeatherService.getCurrentWeather(
      testCoordinates.latitude,
      testCoordinates.longitude
    );

    if (weather) {
      console.log('✅ Weather API Test SUCCESSFUL!');
      console.log('');
      console.log('Current Weather Data:');
      console.log('--------------------');
      console.log(`🌡️  Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`);
      console.log(`💧 Humidity: ${weather.humidity}%`);
      console.log(`🌬️  Wind: ${weather.windSpeed} km/h from ${weather.windDirection}°`);
      console.log(`☁️  Cloud Cover: ${weather.cloudiness}%`);
      console.log(`🌤️  Condition: ${weather.description}`);
      console.log(`📍 Location: ${weather.location}`);
      console.log(`⏰ Updated: ${weather.timestamp.toLocaleString()}`);
      console.log('');
      console.log('🎉 Open-Meteo API is working perfectly!');
      console.log('Your Maharashtra trek app now has real-time weather data.');
    } else {
      console.log('❌ Weather API Test FAILED!');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testWeatherAPI();
