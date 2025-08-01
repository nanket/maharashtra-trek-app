/**
 * Weather Service for real-time weather data
 * Uses Open-Meteo API - Free, open-source weather API with no API key required
 */

import { WEATHER_CONFIG, DEMO_MODE, DEMO_WEATHER_DATA, WEATHER_VARIABLES, WMO_WEATHER_CODES } from '../config/weather';

class WeatherService {
  /**
   * Get current weather for a location using Open-Meteo API
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Weather data
   */
  static async getCurrentWeather(latitude, longitude) {
    // Use demo data if in demo mode
    if (DEMO_MODE) {
      console.log(`Using location-specific demo weather data for ${latitude}, ${longitude}`);
      return new Promise(resolve => {
        setTimeout(() => resolve(this.generateLocationBasedDemoWeather(latitude, longitude)), 1000);
      });
    }

    try {
      const currentVariables = WEATHER_VARIABLES.CURRENT.join(',');
      const url = `${WEATHER_CONFIG.BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentVariables}&timezone=${WEATHER_CONFIG.TIMEZONE}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatOpenMeteoCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.getFallbackWeather();
    }
  }

  /**
   * Get weather forecast using Open-Meteo API
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Forecast data
   */
  static async getWeatherForecast(latitude, longitude) {
    // Use demo data if in demo mode
    if (DEMO_MODE) {
      console.log(`Using location-specific demo forecast data for ${latitude}, ${longitude}`);
      return new Promise(resolve => {
        setTimeout(() => resolve(this.generateLocationBasedDemoForecast(latitude, longitude)), 1200);
      });
    }

    try {
      const dailyVariables = WEATHER_VARIABLES.DAILY.join(',');
      const url = `${WEATHER_CONFIG.BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=${dailyVariables}&timezone=${WEATHER_CONFIG.TIMEZONE}&forecast_days=${WEATHER_CONFIG.FORECAST_DAYS}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatOpenMeteoForecastWeather(data);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getFallbackForecast();
    }
  }

  /**
   * Format current weather data
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted weather data
   */
  static formatCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null, // Convert to km
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      cloudiness: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      location: data.name,
      timestamp: new Date(),
    };
  }

  /**
   * Format current weather data from Open-Meteo API
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted weather data
   */
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
      sunrise: null, // Will be calculated or fetched separately if needed
      sunset: null,
      location: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`,
      timestamp: new Date(),
    };
  }

  /**
   * Format forecast weather data
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted forecast data
   */
  static formatForecastWeather(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temperatures: [],
          conditions: [],
          humidity: [],
          windSpeed: [],
          precipitation: 0,
        };
      }

      dailyForecasts[date].temperatures.push(item.main.temp);
      dailyForecasts[date].conditions.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].windSpeed.push(item.wind.speed * 3.6);

      if (item.rain) {
        dailyForecasts[date].precipitation += item.rain['3h'] || 0;
      }
    });

    // Process daily summaries
    const forecast = Object.values(dailyForecasts).slice(0, 5).map(day => ({
      date: day.date,
      minTemp: Math.round(Math.min(...day.temperatures)),
      maxTemp: Math.round(Math.max(...day.temperatures)),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWindSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      precipitation: Math.round(day.precipitation * 10) / 10, // Round to 1 decimal
      condition: this.getMostCommonCondition(day.conditions),
    }));

    return {
      location: data.city.name,
      forecast,
      timestamp: new Date(),
    };
  }

  /**
   * Format forecast weather data from Open-Meteo API
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted forecast data
   */
  static formatOpenMeteoForecastWeather(data) {
    const daily = data.daily;
    const forecast = [];

    for (let i = 0; i < daily.time.length; i++) {
      const weatherCode = daily.weather_code[i] || 0;
      const weatherInfo = WMO_WEATHER_CODES[weatherCode] || WMO_WEATHER_CODES[0];

      forecast.push({
        date: new Date(daily.time[i]),
        minTemp: Math.round(daily.temperature_2m_min[i] || 0),
        maxTemp: Math.round(daily.temperature_2m_max[i] || 0),
        avgHumidity: 65, // Open-Meteo doesn't provide daily avg humidity, use reasonable default
        avgWindSpeed: Math.round(daily.wind_speed_10m_max[i] || 0),
        precipitation: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
        condition: weatherInfo,
      });
    }

    return {
      location: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`,
      forecast,
      timestamp: new Date(),
    };
  }

  /**
   * Get most common weather condition for the day
   * @param {Array} conditions
   * @returns {Object} Most common condition
   */
  static getMostCommonCondition(conditions) {
    const conditionCounts = {};
    conditions.forEach(condition => {
      const key = condition.main;
      conditionCounts[key] = (conditionCounts[key] || 0) + 1;
    });

    const mostCommon = Object.keys(conditionCounts).reduce((a, b) =>
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    return conditions.find(c => c.main === mostCommon);
  }

  /**
   * Get trek safety assessment based on weather
   * @param {Object} weather - Current weather data
   * @param {Object} forecast - Forecast data
   * @returns {Object} Safety assessment
   */
  static getTrekSafetyAssessment(weather, forecast) {
    const warnings = [];
    let safetyLevel = 'safe'; // safe, caution, dangerous

    // Temperature checks
    if (weather.temperature > 35) {
      warnings.push('Extreme heat - carry extra water and start early');
      safetyLevel = 'caution';
    }
    if (weather.temperature < 5) {
      warnings.push('Very cold conditions - warm clothing essential');
      safetyLevel = 'caution';
    }

    // Weather condition checks
    if (weather.main === 'Rain' || weather.main === 'Thunderstorm') {
      warnings.push('Rain/storms - slippery trails, avoid exposed ridges');
      safetyLevel = 'dangerous';
    }
    if (weather.main === 'Fog' || weather.visibility < 1) {
      warnings.push('Poor visibility - navigation may be difficult');
      safetyLevel = 'caution';
    }

    // Wind checks
    if (weather.windSpeed > 40) {
      warnings.push('Strong winds - avoid exposed areas');
      safetyLevel = 'caution';
    }

    // Forecast checks
    const rainInForecast = forecast.forecast.some(day =>
      day.condition.main === 'Rain' || day.precipitation > 5
    );
    if (rainInForecast) {
      warnings.push('Rain expected in coming days - check trail conditions');
    }

    return {
      safetyLevel,
      warnings,
      recommendation: this.getSafetyRecommendation(safetyLevel, warnings),
    };
  }

  /**
   * Get safety recommendation based on assessment
   * @param {string} safetyLevel
   * @param {Array} warnings
   * @returns {string} Recommendation text
   */
  static getSafetyRecommendation(safetyLevel, warnings) {
    switch (safetyLevel) {
      case 'safe':
        return 'Good conditions for trekking. Enjoy your adventure!';
      case 'caution':
        return 'Proceed with caution. Take extra precautions and inform someone about your trek.';
      case 'dangerous':
        return 'Consider postponing your trek. Current conditions pose significant risks.';
      default:
        return 'Check weather conditions before starting your trek.';
    }
  }

  /**
   * Fallback weather data when API fails
   * @returns {Object} Fallback weather
   */
  static getFallbackWeather() {
    return {
      temperature: null,
      feelsLike: null,
      humidity: null,
      pressure: null,
      visibility: null,
      windSpeed: null,
      windDirection: null,
      description: 'Weather data unavailable',
      main: 'Unknown',
      icon: '01d',
      cloudiness: null,
      sunrise: null,
      sunset: null,
      location: 'Unknown',
      timestamp: new Date(),
      error: true,
    };
  }

  /**
   * Fallback forecast data when API fails
   * @returns {Object} Fallback forecast
   */
  static getFallbackForecast() {
    return {
      location: 'Unknown',
      forecast: [],
      timestamp: new Date(),
      error: true,
    };
  }

  /**
   * Get weather icon URL
   * @param {string} iconCode
   * @returns {string} Icon URL
   */
  static getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Generate location-specific demo weather data
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} Location-specific weather data
   */
  static generateLocationBasedDemoWeather(latitude, longitude) {
    // Create variation based on coordinates
    const latSeed = Math.abs(latitude * 100) % 100;
    const lonSeed = Math.abs(longitude * 100) % 100;
    const timeSeed = Math.floor(Date.now() / (1000 * 60 * 30)); // Changes every 30 minutes

    // Combine seeds for pseudo-randomness
    const seed = (latSeed + lonSeed + timeSeed) % 100;

    // Maharashtra-specific weather patterns
    const baseTemp = this.getSeasonalBaseTemp();
    const tempVariation = (seed % 20) - 10; // ±10°C variation
    const temperature = Math.max(15, Math.min(40, baseTemp + tempVariation));

    // Weather conditions based on location and season
    const conditions = this.getLocationWeatherConditions(latitude, longitude, seed);

    // Generate location name
    const locationName = this.getLocationName(latitude, longitude);

    return {
      temperature: Math.round(temperature),
      feelsLike: Math.round(temperature + ((seed % 10) - 5)),
      humidity: Math.max(30, Math.min(90, 60 + ((seed % 30) - 15))),
      pressure: Math.round(1013 + ((seed % 20) - 10)),
      visibility: Math.max(2, Math.min(15, 10 + ((seed % 10) - 5))),
      windSpeed: Math.max(0, Math.min(30, 8 + ((seed % 15) - 7))),
      windDirection: (seed * 3.6) % 360,
      description: conditions.description,
      main: conditions.main,
      icon: conditions.icon,
      cloudiness: Math.max(0, Math.min(100, conditions.cloudiness)),
      sunrise: new Date(Date.now() - (6 * 60 * 60 * 1000) + ((seed % 60) * 60 * 1000)),
      sunset: new Date(Date.now() + (12 * 60 * 60 * 1000) + ((seed % 60) * 60 * 1000)),
      location: locationName,
      timestamp: new Date(),
    };
  }

  /**
   * Generate location-specific demo forecast data
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} Location-specific forecast data
   */
  static generateLocationBasedDemoForecast(latitude, longitude) {
    const locationName = this.getLocationName(latitude, longitude);
    const forecast = [];

    for (let i = 0; i < 5; i++) {
      const dayDate = new Date(Date.now() + (i * 24 * 60 * 60 * 1000));
      const daySeed = (Math.abs(latitude * longitude * (i + 1)) % 100);

      const baseTemp = this.getSeasonalBaseTemp();
      const tempVariation = (daySeed % 15) - 7;
      const maxTemp = Math.max(18, Math.min(38, baseTemp + tempVariation + 3));
      const minTemp = Math.max(10, Math.min(30, maxTemp - 8 - (daySeed % 5)));

      const conditions = this.getLocationWeatherConditions(latitude, longitude, daySeed + i * 10);

      forecast.push({
        date: dayDate,
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        avgHumidity: Math.max(40, Math.min(85, 65 + ((daySeed % 20) - 10))),
        avgWindSpeed: Math.max(5, Math.min(25, 12 + ((daySeed % 10) - 5))),
        precipitation: conditions.main === 'Rain' ? Math.max(0, (daySeed % 30)) : 0,
        condition: conditions,
      });
    }

    return {
      location: locationName,
      forecast,
      timestamp: new Date(),
    };
  }

  /**
   * Get seasonal base temperature for Maharashtra
   * @returns {number} Base temperature
   */
  static getSeasonalBaseTemp() {
    const month = new Date().getMonth();
    // Maharashtra seasonal temperatures
    const seasonalTemps = {
      0: 25,  // January
      1: 28,  // February
      2: 32,  // March
      3: 35,  // April
      4: 38,  // May
      5: 32,  // June (Monsoon)
      6: 28,  // July (Monsoon)
      7: 27,  // August (Monsoon)
      8: 29,  // September
      9: 32,  // October
      10: 28, // November
      11: 25, // December
    };
    return seasonalTemps[month] || 30;
  }

  /**
   * Get weather conditions based on location and seed
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} seed
   * @returns {Object} Weather conditions
   */
  static getLocationWeatherConditions(latitude, longitude, seed) {
    const month = new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 8; // June to September

    // Higher chance of rain during monsoon
    const rainChance = isMonsoon ? 40 : 15;

    if (seed % 100 < rainChance) {
      const rainIntensity = seed % 3;
      if (rainIntensity === 0) {
        return { main: 'Drizzle', description: 'light drizzle', icon: '09d', cloudiness: 70 };
      } else if (rainIntensity === 1) {
        return { main: 'Rain', description: 'moderate rain', icon: '10d', cloudiness: 85 };
      } else {
        return { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d', cloudiness: 95 };
      }
    } else if (seed % 100 < 30) {
      return { main: 'Clouds', description: 'overcast clouds', icon: '04d', cloudiness: 90 };
    } else if (seed % 100 < 50) {
      return { main: 'Clouds', description: 'scattered clouds', icon: '03d', cloudiness: 60 };
    } else if (seed % 100 < 70) {
      return { main: 'Clouds', description: 'few clouds', icon: '02d', cloudiness: 25 };
    } else {
      return { main: 'Clear', description: 'clear sky', icon: '01d', cloudiness: 5 };
    }
  }

  /**
   * Get location name based on coordinates
   * @param {number} latitude
   * @param {number} longitude
   * @returns {string} Location name
   */
  static getLocationName(latitude, longitude) {
    // Maharashtra trek locations mapping
    const locations = [
      { lat: 18.2467, lon: 73.6815, name: 'Rajgad Fort Area' },
      { lat: 18.3664, lon: 73.7567, name: 'Sinhagad Fort Area' },
      { lat: 18.7077, lon: 73.4107, name: 'Lohagad Fort Area' },
      { lat: 19.0330, lon: 73.7642, name: 'Kalsubai Peak Area' },
      { lat: 18.1124, lon: 73.4354, name: 'Torna Fort Area' },
      { lat: 18.8642, lon: 73.3119, name: 'Harishchandragad Area' },
    ];

    // Find closest location
    let closestLocation = 'Maharashtra Trek Area';
    let minDistance = Infinity;

    locations.forEach(location => {
      const distance = Math.sqrt(
        Math.pow(latitude - location.lat, 2) + Math.pow(longitude - location.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location.name;
      }
    });

    return closestLocation;
  }

  /**
   * Get weather emoji based on condition
   * @param {string} condition
   * @returns {string} Weather emoji
   */
  static getWeatherEmoji(condition) {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Dust': '🌪️',
      'Sand': '🌪️',
      'Ash': '🌋',
      'Squall': '💨',
      'Tornado': '🌪️',
    };

    return emojiMap[condition] || '🌤️';
  }
}

export default WeatherService;
