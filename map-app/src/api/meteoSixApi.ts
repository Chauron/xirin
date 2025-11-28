/**
 * MeteoSIX API Integration (MeteoGalicia)
 * 
 * Official API for Galicia weather and marine forecasting
 * Documentation: https://www.meteogalicia.gal/web/apiv5/
 * Coverage: Galicia (Spain) and surrounding waters
 * 
 * Models available:
 * - WRF: Weather forecast (temperature, wind, precipitation, etc.)
 * - WW3/SWAN: Wave forecast
 * - ROMS/MOHID: Ocean currents and temperature
 * - Tides: Tide predictions for Galician coast
 * 
 * CORS Issue: MeteoSIX API doesn't support CORS for browser requests
 * Solution: Use proxy server (vite-proxy-server.js) to forward requests
 */

import axios from 'axios';

// Use proxy server to bypass CORS restrictions
const METEOSIX_BASE_URL = import.meta.env.VITE_METEOSIX_PROXY_URL || 'http://localhost:3001/api/meteosix';
const API_KEY = import.meta.env.VITE_METEOSIX_API_KEY;

// Check if coordinates are within Galicia/nearby waters coverage
// Approximate bounds: 41.8°N to 43.8°N, -9.3°W to -6.7°W
function isWithinGaliciaCoverage(lat: number, lng: number): boolean {
  return lat >= 41.5 && lat <= 44.0 && lng >= -9.5 && lng <= -6.5;
}

interface MeteoSixVariable {
  name: string;
  model: string;
  grid: string;
  units?: string;
  moduleUnits?: string;
  directionUnits?: string;
  values: MeteoSixValue[];
}

interface MeteoSixValue {
  timeInstant: string;
  modelRun: string;
  value?: number | string;
  moduleValue?: number;
  directionValue?: number;
  iconURL?: string;
}

interface MeteoSixDay {
  timePeriod: {
    begin: { timeInstant: string };
    end: { timeInstant: string };
  };
  variables: MeteoSixVariable[];
}

interface MeteoSixResponse {
  type: string;
  features: Array<{
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: {
      days: MeteoSixDay[];
    };
  }>;
}

interface TideEvent {
  time: string;
  type: 'high' | 'low';
  height: number;
}

interface TideValue {
  timeInstant: string;
  height: number;
}

interface MeteoSixTideResponse {
  type: string;
  features: Array<{
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: {
      port: {
        id: string;
        name: string;
      };
      referencePort: {
        id: string;
        name: string;
      };
      days: Array<{
        timePeriod: {
          begin: { timeInstant: string };
          end: { timeInstant: string };
        };
        variables: Array<{
          name: string;
          units: string;
          summary: Array<{
            id: number;
            state: string;
            timeInstant: string;
            height: number;
          }>;
          values: TideValue[];
        }>;
      }>;
    };
  }>;
}

/**
 * Fetch numeric weather forecast from MeteoSIX
 * Uses WRF model for atmospheric data
 */
export async function fetchMeteoSixWeather(lat: number, lng: number): Promise<any> {
  if (!API_KEY) {
    console.log('⚠️ MeteoSIX API key not configured');
    return null;
  }

  if (!isWithinGaliciaCoverage(lat, lng)) {
    console.log('📍 Location outside MeteoSIX coverage area');
    return null;
  }

  try {
    console.log('🌦️ Fetching weather data from MeteoSIX API...');
    
    const variables = [
      'temperature',
      'wind',
      'precipitation_amount',
      'relative_humidity',
      'cloud_area_fraction',
      'air_pressure_at_sea_level',
      'sky_state'
    ].join(',');

    const response = await axios.get<MeteoSixResponse>(`${METEOSIX_BASE_URL}/getNumericForecastInfo`, {
      params: {
        coords: `${lng},${lat}`,
        variables,
        API_KEY,
        format: 'application/json',
        lang: 'es',
        tz: 'Europe/Madrid'
      },
      timeout: 10000
    });

    if (response.data?.features?.[0]?.properties?.days) {
      console.log('✅ MeteoSIX weather data received');
      return response.data;
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('❌ MeteoSIX API key invalid or expired');
      } else if (error.response?.status === 216) {
        console.log('📍 Point outside MeteoSIX geographic limits');
      } else {
        console.error('❌ MeteoSIX weather API error:', error.message);
      }
    } else {
      console.error('❌ Unexpected error fetching MeteoSIX weather:', error);
    }
    return null;
  }
}

/**
 * Fetch marine forecast from MeteoSIX
 * Uses WW3/SWAN for waves and ROMS for sea temperature
 */
export async function fetchMeteoSixMarine(lat: number, lng: number): Promise<any> {
  if (!API_KEY) {
    console.log('⚠️ MeteoSIX API key not configured');
    return null;
  }

  if (!isWithinGaliciaCoverage(lat, lng)) {
    console.log('📍 Location outside MeteoSIX coverage area');
    return null;
  }

  try {
    console.log('🌊 Fetching marine data from MeteoSIX API...');
    
    const variables = [
      'significative_wave_height',
      'mean_wave_direction',
      'relative_peak_period',
      'sea_water_temperature'
    ].join(',');

    const response = await axios.get<MeteoSixResponse>(`${METEOSIX_BASE_URL}/getNumericForecastInfo`, {
      params: {
        coords: `${lng},${lat}`,
        variables,
        API_KEY,
        format: 'application/json',
        lang: 'es',
        tz: 'Europe/Madrid'
      },
      timeout: 10000
    });

    if (response.data?.features?.[0]?.properties?.days) {
      console.log('✅ MeteoSIX marine data received');
      return response.data;
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('❌ MeteoSIX API key invalid or expired');
      } else if (error.response?.status === 216) {
        console.log('📍 Point outside MeteoSIX marine coverage');
      } else {
        console.error('❌ MeteoSIX marine API error:', error.message);
      }
    } else {
      console.error('❌ Unexpected error fetching MeteoSIX marine:', error);
    }
    return null;
  }
}

/**
 * Fetch tide information from MeteoSIX
 * Provides high/low tide times and heights for Galician coast
 */
export async function fetchMeteoSixTides(lat: number, lng: number, startDate?: Date, endDate?: Date): Promise<TideEvent[]> {
  if (!API_KEY) {
    console.log('⚠️ MeteoSIX API key not configured');
    return [];
  }

  if (!isWithinGaliciaCoverage(lat, lng)) {
    console.log('📍 Location outside MeteoSIX tide coverage');
    return [];
  }

  try {
    console.log('🌊 Fetching tide data from MeteoSIX API...');
    
    const params: any = {
      coords: `${lng},${lat}`,
      API_KEY,
      format: 'application/json',
      lang: 'es',
      tz: 'Europe/Madrid'
    };

    // Add date range if provided
    if (startDate) {
      params.startTime = startDate.toISOString().split('.')[0];
    }
    if (endDate) {
      params.endTime = endDate.toISOString().split('.')[0];
    }

    const response = await axios.get<MeteoSixTideResponse>(`${METEOSIX_BASE_URL}/getTidesInfo`, {
      params,
      timeout: 10000
    });

    if (response.data?.features?.[0]?.properties?.days) {
      const tideEvents: TideEvent[] = [];
      const days = response.data.features[0].properties.days;

      // Extract tide events from summary (high/low tides)
      for (const day of days) {
        const tideVariable = day.variables.find(v => v.name === 'tides');
        if (tideVariable?.summary) {
          for (const event of tideVariable.summary) {
            tideEvents.push({
              time: event.timeInstant,
              type: event.state === 'High tide' ? 'high' : 'low',
              height: event.height
            });
          }
        }
      }

      console.log(`✅ MeteoSIX tide data received: ${tideEvents.length} events`);
      return tideEvents;
    }

    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('❌ MeteoSIX API key invalid or expired');
      } else if (error.response?.status === 216) {
        console.log('📍 Point outside MeteoSIX tide coverage (must be near Galician coast)');
      } else {
        console.error('❌ MeteoSIX tide API error:', error.message);
      }
    } else {
      console.error('❌ Unexpected error fetching MeteoSIX tides:', error);
    }
    return [];
  }
}

/**
 * Parse MeteoSIX weather response to extract current conditions
 */
export function parseMeteoSixCurrentWeather(data: MeteoSixResponse) {
  try {
    console.log('🔍 Parsing MeteoSIX current weather data...');
    const feature = data.features[0];
    if (!feature?.properties?.days?.[0]) {
      console.warn('⚠️ No feature or days data in MeteoSIX response');
      return null;
    }

    const firstDay = feature.properties.days[0];
    const now = new Date();
    console.log('📅 Processing first day data...');

    // Find variables
    const tempVar = firstDay.variables.find(v => v.name === 'temperature');
    const windVar = firstDay.variables.find(v => v.name === 'wind');
    const pressureVar = firstDay.variables.find(v => v.name === 'air_pressure_at_sea_level');
    const humidityVar = firstDay.variables.find(v => v.name === 'relative_humidity');
    const cloudsVar = firstDay.variables.find(v => v.name === 'cloud_area_fraction');

    console.log('🔍 Variables found:', {
      temperature: tempVar ? `${tempVar.values?.length || 0} values` : 'NOT FOUND',
      wind: windVar ? `${windVar.values?.length || 0} values` : 'NOT FOUND',
      pressure: pressureVar ? `${pressureVar.values?.length || 0} values` : 'NOT FOUND',
      humidity: humidityVar ? `${humidityVar.values?.length || 0} values` : 'NOT FOUND',
      clouds: cloudsVar ? `${cloudsVar.values?.length || 0} values` : 'NOT FOUND'
    });

    // Find current hour values
    const getCurrentValue = (variable: MeteoSixVariable | undefined) => {
      if (!variable?.values) return null;
      
      // Find closest time to now
      const currentValue = variable.values.find(v => {
        const valueTime = new Date(v.timeInstant);
        return valueTime >= now;
      });

      return currentValue || variable.values[0];
    };

    const tempValue = getCurrentValue(tempVar);
    const windValue = getCurrentValue(windVar);
    const pressureValue = getCurrentValue(pressureVar);
    const humidityValue = getCurrentValue(humidityVar);
    const cloudsValue = getCurrentValue(cloudsVar);

    console.log('📊 Current values extracted:', {
      temperature: tempValue?.value,
      windSpeed: windValue?.moduleValue,
      windDirection: windValue?.directionValue,
      pressure: pressureValue?.value,
      humidity: humidityValue?.value,
      cloudCover: cloudsValue?.value
    });

    const result = {
      temperature: tempValue?.value as number || 0,
      windSpeed: windValue?.moduleValue || 0,
      windDirection: windValue?.directionValue || 0,
      pressure: pressureValue?.value as number || 0,
      humidity: humidityValue?.value as number || 0,
      cloudCover: cloudsValue?.value as number || 0
    };

    console.log('✅ Parsed MeteoSIX current weather:', result);
    return result;
  } catch (error) {
    console.error('❌ Error parsing MeteoSIX current weather:', error);
    return null;
  }
}

/**
 * Parse MeteoSIX response to extract hourly forecast
 */
export function parseMeteoSixHourlyForecast(data: MeteoSixResponse) {
  try {
    const feature = data.features[0];
    if (!feature?.properties?.days) return [];

    const hourlyData: any[] = [];

    for (const day of feature.properties.days) {
      const tempVar = day.variables.find(v => v.name === 'temperature');
      const windVar = day.variables.find(v => v.name === 'wind');
      const precipVar = day.variables.find(v => v.name === 'precipitation_amount');
      const pressureVar = day.variables.find(v => v.name === 'air_pressure_at_sea_level');
      const cloudsVar = day.variables.find(v => v.name === 'cloud_area_fraction');

      if (!tempVar?.values) continue;

      for (let i = 0; i < tempVar.values.length; i++) {
        // Normalize time format - MeteoSIX uses ISO format but timezone may be incomplete
        // e.g., "2025-11-29T13:00:00+01" should be "2025-11-29T13:00:00+01:00"
        let timeInstant = tempVar.values[i].timeInstant;
        if (timeInstant && /\+\d{2}$/.test(timeInstant)) {
          timeInstant = timeInstant + ':00';
        } else if (timeInstant && /-\d{2}$/.test(timeInstant)) {
          timeInstant = timeInstant + ':00';
        }
        
        hourlyData.push({
          time: timeInstant,
          temperature: tempVar.values[i].value as number || 0,
          windSpeed: windVar?.values[i]?.moduleValue || 0,
          windDirection: windVar?.values[i]?.directionValue || 0,
          precipitation: precipVar?.values[i]?.value as number || 0,
          pressure: pressureVar?.values[i]?.value as number || 0,
          cloudCover: cloudsVar?.values[i]?.value as number || 0
        });
      }
    }

    console.log('📊 MeteoSIX hourly forecast parsed:', hourlyData.length, 'hours');
    if (hourlyData.length > 0) {
      console.log('   First hour:', hourlyData[0]);
    }

    return hourlyData;
  } catch (error) {
    console.error('❌ Error parsing MeteoSIX hourly forecast:', error);
    return [];
  }
}

/**
 * Parse MeteoSIX marine response to extract wave data
 */
/**
 * Parse MeteoSIX marine response to extract hourly data
 */
export function parseMeteoSixHourlyMarine(data: MeteoSixResponse) {
  try {
    const feature = data.features[0];
    if (!feature?.properties?.days) return [];

    const hourlyData: any[] = [];

    for (const day of feature.properties.days) {
      const waveHeightVar = day.variables.find(v => v.name === 'significative_wave_height');
      const waveDirVar = day.variables.find(v => v.name === 'mean_wave_direction');
      const wavePeriodVar = day.variables.find(v => v.name === 'relative_peak_period');
      const seaTempVar = day.variables.find(v => v.name === 'sea_water_temperature');

      if (!waveHeightVar?.values) continue;

      // Get the number of time points (should be same for all variables)
      const numPoints = waveHeightVar.values.length;

      for (let i = 0; i < numPoints; i++) {
        // Normalize time format - MeteoSIX uses ISO format but timezone may be incomplete
        // e.g., "2025-11-29T13:00:00+01" should be "2025-11-29T13:00:00+01:00"
        let timeInstant = waveHeightVar.values[i].timeInstant;
        if (timeInstant && /\+\d{2}$/.test(timeInstant)) {
          timeInstant = timeInstant + ':00';
        } else if (timeInstant && /-\d{2}$/.test(timeInstant)) {
          timeInstant = timeInstant + ':00';
        }
        
        hourlyData.push({
          time: timeInstant,
          waveHeight: waveHeightVar.values[i].value as number || 0,
          waveDirection: waveDirVar?.values?.[i]?.value as number || 0,
          wavePeriod: wavePeriodVar?.values?.[i]?.value as number || 0,
          seaTemperature: seaTempVar?.values?.[i]?.value as number || 0
        });
      }
    }

    console.log('🌊 MeteoSIX hourly marine parsed:', hourlyData.length, 'hours');
    if (hourlyData.length > 0) {
      console.log('   First hour:', hourlyData[0]);
    }

    return hourlyData;
  } catch (error) {
    console.error('❌ Error parsing MeteoSIX hourly marine data:', error);
    return [];
  }
}

/**
 * Parse MeteoSIX marine response to extract current conditions
 */
export function parseMeteoSixMarineData(data: MeteoSixResponse) {
  try {
    const feature = data.features[0];
    if (!feature?.properties?.days?.[0]) return null;

    const firstDay = feature.properties.days[0];
    const now = new Date();

    const waveHeightVar = firstDay.variables.find(v => v.name === 'significative_wave_height');
    const waveDirVar = firstDay.variables.find(v => v.name === 'mean_wave_direction');
    const wavePeriodVar = firstDay.variables.find(v => v.name === 'relative_peak_period');
    const seaTempVar = firstDay.variables.find(v => v.name === 'sea_water_temperature');

    const getCurrentValue = (variable: MeteoSixVariable | undefined) => {
      if (!variable?.values) return null;
      const currentValue = variable.values.find(v => {
        const valueTime = new Date(v.timeInstant);
        return valueTime >= now;
      });
      return currentValue || variable.values[0];
    };

    const waveHeightValue = getCurrentValue(waveHeightVar);
    const waveDirValue = getCurrentValue(waveDirVar);
    const wavePeriodValue = getCurrentValue(wavePeriodVar);
    const seaTempValue = getCurrentValue(seaTempVar);

    return {
      waveHeight: waveHeightValue?.value as number || 0,
      waveDirection: waveDirValue?.value as number || 0,
      wavePeriod: wavePeriodValue?.value as number || 0,
      seaTemperature: seaTempValue?.value as number || 0
    };
  } catch (error) {
    console.error('Error parsing MeteoSIX marine data:', error);
    return null;
  }
}

export { isWithinGaliciaCoverage };
