import axios from 'axios';

const OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export const fetchMarineWeather = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(OPEN_METEO_MARINE_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'wave_height,wave_direction,wave_period',
        timezone: 'auto',
        forecast_days: 3
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching marine weather:', error);
    return null;
  }
};

export const fetchWeatherForecast = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(OPEN_METEO_WEATHER_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover',
        current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
        timezone: 'auto',
        forecast_days: 3
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
};

// Helper to get current conditions for a catch
export const getCurrentConditions = async (lat: number, lng: number) => {
    const weather = await fetchWeatherForecast(lat, lng);
    // const marine = await fetchMarineWeather(lat, lng); // Available for future use

    if (!weather || !weather.current) return null;

    return {
        temperature: weather.current.temperature_2m,
        windSpeed: weather.current.wind_speed_10m,
        windDirection: weather.current.wind_direction_10m,
        // Note: Marine API usually doesn't have "current", we take the closest hourly index
        // For simplicity here we might skip wave data for "current" or calculate closest hour
        // This is a simplified implementation
    };
};
