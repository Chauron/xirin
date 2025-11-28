import axios from 'axios';
import type { HourlyWeatherData } from '../models/types';
import type { WeatherProvider, WaveProvider } from '../models/settings';
import { 
  fetchMeteoSixWeather, 
  fetchMeteoSixMarine, 
  parseMeteoSixCurrentWeather,
  parseMeteoSixHourlyForecast,
  parseMeteoSixMarineData,
  parseMeteoSixHourlyMarine,
  isWithinGaliciaCoverage 
} from './meteoSixApi';

const OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export const fetchMarineWeather = async (lat: number, lng: number, provider: WaveProvider = 'open-meteo') => {
  try {
    // Use MeteoSIX only if explicitly selected and location is in Galicia
    if (provider === 'meteosix' && isWithinGaliciaCoverage(lat, lng)) {
      console.log('📍 Using MeteoSIX for marine data (user preference)');
      const meteoSixData = await fetchMeteoSixMarine(lat, lng);
      if (meteoSixData) {
        console.log('✅ Using REAL marine data from MeteoSIX (high resolution)');
        
        // Parse MeteoSIX marine data and normalize to Open-Meteo format
        const marineData = parseMeteoSixHourlyMarine(meteoSixData);
        
        if (marineData && marineData.length > 0) {
          // Create normalized response compatible with Open-Meteo structure
          const normalizedData = {
            hourly: {
              time: marineData.map((h: any) => h.time),
              wave_height: marineData.map((h: any) => h.waveHeight || 0),
              wave_direction: marineData.map((h: any) => h.waveDirection || 0),
              wave_period: marineData.map((h: any) => h.wavePeriod || 0)
            }
          };
          
          return { source: 'MeteoSIX', data: normalizedData };
        }
      }
      console.warn('⚠️ MeteoSIX marine data unavailable, falling back to Open-Meteo');
    }

    // Use Open-Meteo (default or fallback)
    console.log(`Fetching REAL marine data from Open-Meteo for: ${lat}, ${lng}`);
    const response = await axios.get(OPEN_METEO_MARINE_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'wave_height,wave_direction,wave_period',
        timezone: 'auto',
        forecast_days: 3
      }
    });
    console.log('✅ Marine API response received from Open-Meteo:', response.data ? '✓ Data available' : '✗ No data');
    return { source: 'Open-Meteo', data: response.data };
  } catch (error) {
    console.error('Error fetching marine weather:', error);
    return null;
  }
};

export const fetchWeatherForecast = async (lat: number, lng: number, provider: WeatherProvider = 'open-meteo') => {
  try {
    // Use MeteoSIX only if explicitly selected and location is in Galicia
    if (provider === 'meteosix' && isWithinGaliciaCoverage(lat, lng)) {
      console.log('📍 Using MeteoSIX for weather data (user preference)');
      const meteoSixData = await fetchMeteoSixWeather(lat, lng);
      if (meteoSixData) {
        console.log('✅ Using REAL weather data from MeteoSIX (high resolution)');
        
        // Parse MeteoSIX data and normalize to Open-Meteo format
        const currentWeather = parseMeteoSixCurrentWeather(meteoSixData);
        const hourlyForecast = parseMeteoSixHourlyForecast(meteoSixData);
        
        if (currentWeather && hourlyForecast.length > 0) {
          // Create normalized response compatible with Open-Meteo structure
          const normalizedData = {
            current: {
              temperature_2m: currentWeather.temperature,
              wind_speed_10m: currentWeather.windSpeed,
              wind_direction_10m: currentWeather.windDirection,
              pressure_msl: currentWeather.pressure,
              weather_code: 0 // MeteoSIX doesn't provide weather code
            },
            hourly: {
              time: hourlyForecast.map((h: any) => h.time),
              temperature_2m: hourlyForecast.map((h: any) => h.temperature),
              wind_speed_10m: hourlyForecast.map((h: any) => h.windSpeed),
              wind_direction_10m: hourlyForecast.map((h: any) => h.windDirection),
              pressure_msl: hourlyForecast.map((h: any) => h.pressure),
              cloud_cover: hourlyForecast.map((h: any) => h.cloudCover || 0),
              relative_humidity_2m: hourlyForecast.map((h: any) => h.humidity || 0)
            }
          };
          
          return { source: 'MeteoSIX', data: normalizedData };
        }
      }
      console.warn('⚠️ MeteoSIX weather data unavailable, falling back to Open-Meteo');
    }

    // Use Open-Meteo (default or fallback)
    console.log(`Fetching REAL weather data from Open-Meteo for: ${lat}, ${lng}`);
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
    console.log('✅ Weather API response received from Open-Meteo:', response.data ? '✓ Data available' : '✗ No data');
    return { source: 'Open-Meteo', data: response.data };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
};

// Helper to get current conditions for a catch
export const getCurrentConditions = async (lat: number, lng: number) => {
    try {
        const weatherResponse = await fetchWeatherForecast(lat, lng);
        
        if (!weatherResponse) {
            console.error('No weather data received');
            return null;
        }

        // Handle MeteoSIX response
        if (weatherResponse.source === 'MeteoSIX') {
            console.log('Real weather data from MeteoSIX (Galicia high-resolution)');
            const currentData = parseMeteoSixCurrentWeather(weatherResponse.data);
            if (currentData) {
                return {
                    temperature: currentData.temperature,
                    windSpeed: currentData.windSpeed,
                    windDirection: currentData.windDirection,
                };
            }
        }

        // Handle Open-Meteo response
        const weather = weatherResponse.data;
        if (!weather || !weather.current) {
            console.error('No weather data available from Open-Meteo');
            return null;
        }

        console.log('Real weather data from Open-Meteo:', {
            temp: weather.current.temperature_2m,
            wind: weather.current.wind_speed_10m,
            direction: weather.current.wind_direction_10m
        });

        return {
            temperature: weather.current.temperature_2m || 0,
            windSpeed: weather.current.wind_speed_10m || 0,
            windDirection: weather.current.wind_direction_10m || 0,
        };
    } catch (error) {
        console.error('Error getting current conditions:', error);
        return null;
    }
};

// Get full day weather data for a specific date
export const getDayWeatherData = async (lat: number, lng: number, date: Date): Promise<HourlyWeatherData[]> => {
  try {
    console.log(`Fetching full day weather for: ${date.toISOString().split('T')[0]}`);
    
    const [weatherResponse, marineResponse] = await Promise.all([
      fetchWeatherForecast(lat, lng),
      fetchMarineWeather(lat, lng)
    ]);

    if (!weatherResponse) {
      console.error('No hourly weather data available');
      return [];
    }

    const targetDate = date.toISOString().split('T')[0];
    const hourlyData: HourlyWeatherData[] = [];

    // Handle MeteoSIX response
    if (weatherResponse.source === 'MeteoSIX') {
      console.log('✅ Using MeteoSIX data for hourly forecast (Galicia)');
      const meteoSixHourly = parseMeteoSixHourlyForecast(weatherResponse.data);
      
      for (const hour of meteoSixHourly) {
        if (hour.time.startsWith(targetDate)) {
          let waveData = null;
          if (marineResponse?.source === 'MeteoSIX') {
            waveData = parseMeteoSixMarineData(marineResponse.data);
          }

          hourlyData.push({
            time: hour.time,
            temperature: hour.temperature,
            windSpeed: hour.windSpeed,
            windDirection: hour.windDirection,
            pressure: hour.pressure,
            cloudCover: hour.cloudCover,
            waveHeight: waveData?.waveHeight,
            wavePeriod: waveData?.wavePeriod,
            waveDirection: waveData?.waveDirection,
          });
        }
      }

      console.log(`✓ Retrieved ${hourlyData.length} hours of MeteoSIX data for ${targetDate}`);
      return hourlyData;
    }

    // Handle Open-Meteo response
    const weather = weatherResponse.data;
    const marine = marineResponse?.data;

    if (!weather || !weather.hourly) {
      console.error('No hourly weather data available from Open-Meteo');
      return [];
    }

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

    console.log(`✓ Retrieved ${hourlyData.length} hours of REAL weather data from Open-Meteo for ${targetDate}`);
    return hourlyData;
  } catch (error) {
    console.error('Error fetching day weather data:', error);
    return [];
  }
};

