import axios from 'axios';
import type { HourlyWeatherData } from '../models/types';

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

// Get full day weather data for a specific date
export const getDayWeatherData = async (lat: number, lng: number, date: Date): Promise<HourlyWeatherData[]> => {
  try {
    const [weather, marine] = await Promise.all([
      fetchWeatherForecast(lat, lng),
      fetchMarineWeather(lat, lng)
    ]);

    if (!weather || !weather.hourly) return [];

    const targetDate = date.toISOString().split('T')[0];
    const hourlyData: HourlyWeatherData[] = [];

    for (let i = 0; i < weather.hourly.time.length; i++) {
      const timeStr = weather.hourly.time[i];
      if (timeStr.startsWith(targetDate)) {
        hourlyData.push({
          time: timeStr,
          temperature: weather.hourly.temperature_2m?.[i] || 0,
          windSpeed: weather.hourly.wind_speed_10m?.[i] || 0,
          windDirection: weather.hourly.wind_direction_10m?.[i] || 0,
          pressure: weather.hourly.pressure_msl?.[i],
          cloudCover: weather.hourly.cloud_cover?.[i],
          waveHeight: marine?.hourly?.wave_height?.[i],
          wavePeriod: marine?.hourly?.wave_period?.[i],
          waveDirection: marine?.hourly?.wave_direction?.[i],
        });
      }
    }

    return hourlyData;
  } catch (error) {
    console.error('Error fetching day weather data:', error);
    return [];
  }
};

