import axios from 'axios';
import { fetchMeteoSixTides, isWithinGaliciaCoverage } from './meteoSixApi';

export interface TideEvent {
  time: string;
  type: 'high' | 'low';
  height: number;
}

interface TideData {
  extremes: TideEvent[];
  date: string;
}

// Type for tide providers - aligned with settings.ts
export type TideProvider = 'none' | 'opentide' | 'puertos' | 'noaa' | 'meteosix';

// NOAA Station data
interface NOAAStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Major NOAA tide stations (expandir según necesites)
const NOAA_STATIONS: NOAAStation[] = [
  { id: '9414290', name: 'San Francisco', lat: 37.8063, lng: -122.4659 },
  { id: '8454000', name: 'Providence', lat: 41.8071, lng: -71.4012 },
  { id: '8518750', name: 'The Battery, NY', lat: 40.7006, lng: -74.0142 },
  { id: '8771450', name: 'Galveston', lat: 29.3100, lng: -94.7900 },
  { id: '9410170', name: 'San Diego', lat: 32.7142, lng: -117.1736 },
  { id: '8574680', name: 'Lewes', lat: 38.7821, lng: -75.1198 },
  { id: '8638610', name: 'Sewells Point, VA', lat: 36.9467, lng: -76.3300 },
  { id: '8723214', name: 'Virginia Key, FL', lat: 25.7314, lng: -80.1614 },
];

// Puertos del Estado stations (principales puertos españoles)
const PUERTOS_STATIONS = [
  { id: '1', name: 'A Coruña', lat: 43.3667, lng: -8.4000 },
  { id: '2', name: 'Bilbao', lat: 43.3500, lng: -3.0333 },
  { id: '3', name: 'Santander', lat: 43.4667, lng: -3.7833 },
  { id: '4', name: 'Gijón', lat: 43.5500, lng: -5.6667 },
  { id: '5', name: 'Barcelona', lat: 41.3500, lng: 2.1833 },
  { id: '6', name: 'Valencia', lat: 39.4500, lng: -0.3333 },
  { id: '7', name: 'Málaga', lat: 36.7167, lng: -4.4167 },
  { id: '8', name: 'Cádiz', lat: 36.5333, lng: -6.3000 },
  { id: '9', name: 'Huelva', lat: 37.2167, lng: -6.9500 },
  { id: '10', name: 'Vigo', lat: 42.2333, lng: -8.7333 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Find nearest station from a list
function findNearestStation(lat: number, lng: number, stations: Array<{lat: number, lng: number, id: string, name: string}>) {
  let nearest = stations[0];
  let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);
  
  for (const station of stations) {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
  }
  
  return nearest;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ============================================
// WORLDTIDES API (OPENTIDE)
// ============================================

async function fetchWorldTidesData(lat: number, lng: number, daysOffset: number): Promise<TideData | null> {
  const apiKey = import.meta.env.VITE_WORLDTIDES_API_KEY;
  
  if (!apiKey || apiKey === 'your_worldtides_api_key_here') {
    console.warn('⚠️ WorldTides API key not configured. Set VITE_WORLDTIDES_API_KEY in .env file');
    console.warn('Get your API key at: https://www.worldtides.info/register');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
  
  try {
    console.log('🌍 Fetching REAL tide data from WorldTides API...');
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    const start = Math.floor(targetDate.getTime() / 1000);
    const length = 86400; // 24 hours in seconds
    
    const response = await axios.get('https://www.worldtides.info/api/v3', {
      params: {
        extremes: true,
        heights: false,
        lat,
        lon: lng,
        start,
        length,
        key: apiKey
      }
    });
    
    if (!response.data || !response.data.extremes) {
      console.error('Invalid WorldTides API response');
      return fetchSimulatedTideData(lat, lng, daysOffset);
    }
    
    const extremes: TideEvent[] = response.data.extremes.map((e: any) => ({
      time: new Date(e.dt * 1000).toISOString(),
      type: e.type === 'High' ? 'high' : 'low',
      height: parseFloat(e.height.toFixed(2))
    }));
    
    console.log(`✅ Retrieved ${extremes.length} REAL tide events from WorldTides`);
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching WorldTides data:', error);
    console.warn('Falling back to simulated data...');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
}

// ============================================
// NOAA CO-OPS API
// ============================================

async function fetchNOAATideData(lat: number, lng: number, daysOffset: number): Promise<TideData | null> {
  try {
    console.log('🇺🇸 Fetching REAL tide data from NOAA CO-OPS API...');
    
    // Find nearest NOAA station
    const station = findNearestStation(lat, lng, NOAA_STATIONS);
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    
    if (distance > 100) {
      console.warn(`⚠️ Nearest NOAA station (${station.name}) is ${distance.toFixed(0)}km away`);
      console.warn('NOAA API only covers US locations. Falling back to simulated data...');
      return fetchSimulatedTideData(lat, lng, daysOffset);
    }
    
    console.log(`Using NOAA station: ${station.name} (${distance.toFixed(1)}km away)`);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      params: {
        product: 'predictions',
        application: import.meta.env.VITE_NOAA_APP_NAME || 'XirinMarine',
        begin_date: dateStr,
        range: 24,
        datum: 'MLLW',
        station: station.id,
        time_zone: 'gmt',
        units: 'metric',
        interval: 'hilo',
        format: 'json'
      }
    });
    
    if (!response.data || !response.data.predictions) {
      console.error('Invalid NOAA API response');
      return fetchSimulatedTideData(lat, lng, daysOffset);
    }
    
    const extremes: TideEvent[] = response.data.predictions.map((p: any) => ({
      time: new Date(p.t).toISOString(),
      type: p.type === 'H' ? 'high' : 'low',
      height: parseFloat(p.v)
    }));
    
    console.log(`✅ Retrieved ${extremes.length} REAL tide events from NOAA`);
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching NOAA tide data:', error);
    console.warn('Falling back to simulated data...');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
}

// ============================================
// PUERTOS DEL ESTADO API (SPAIN)
// ============================================

async function fetchPuertosData(lat: number, lng: number, daysOffset: number): Promise<TideData | null> {
  try {
    console.log('🇪🇸 Fetching REAL tide data from Puertos del Estado...');
    
    // Find nearest Spanish port
    const puerto = findNearestStation(lat, lng, PUERTOS_STATIONS);
    const distance = calculateDistance(lat, lng, puerto.lat, puerto.lng);
    
    if (distance > 50) {
      console.warn(`⚠️ Nearest Spanish port (${puerto.name}) is ${distance.toFixed(0)}km away`);
      console.warn('Puertos del Estado API only covers Spanish ports. Falling back to simulated data...');
      return fetchSimulatedTideData(lat, lng, daysOffset);
    }
    
    console.log(`Using Spanish port: ${puerto.name} (${distance.toFixed(1)}km away)`);
    
    // NOTE: Puertos del Estado API requires registration and authentication
    // This is a placeholder implementation
    // Contact: oceanografia@puertos.es for API access
    
    const apiKey = import.meta.env.VITE_PUERTOS_API_KEY;
    
    if (!apiKey || apiKey === 'your_puertos_api_key_here') {
      console.warn('⚠️ Puertos del Estado API key not configured');
      console.warn('Contact oceanografia@puertos.es to request API access');
      console.warn('Falling back to simulated data...');
      return fetchSimulatedTideData(lat, lng, daysOffset);
    }
    
    // TODO: Implement actual Puertos del Estado API call when you have access
    // The exact endpoint and parameters depend on their API documentation
    
    console.warn('⚠️ Puertos del Estado API implementation pending');
    console.warn('Using simulated data for now...');
    return fetchSimulatedTideData(lat, lng, daysOffset);
    
  } catch (error) {
    console.error('Error fetching Puertos del Estado data:', error);
    console.warn('Falling back to simulated data...');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
}

// ============================================
// METEOSIX API (METEOGALICIA)
// ============================================

async function fetchMeteoSixTideData(lat: number, lng: number, daysOffset: number): Promise<TideData | null> {
  // Check if location is within Galicia coverage
  if (!isWithinGaliciaCoverage(lat, lng)) {
    console.log('📍 Location outside MeteoSIX coverage (Galicia region)');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }

  try {
    console.log('🌊 Fetching REAL tide data from MeteoSIX (MeteoGalicia)...');
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    
    // Fetch tide data for the target date
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const tideEvents = await fetchMeteoSixTides(lat, lng, startDate, endDate);
    
    if (tideEvents && tideEvents.length > 0) {
      console.log(`✅ MeteoSIX tide data received: ${tideEvents.length} events for ${targetDate.toISOString().split('T')[0]}`);
      
      return {
        extremes: tideEvents,
        date: targetDate.toISOString().split('T')[0]
      };
    }
    
    console.log('⚠️ No MeteoSIX tide data available, falling back to simulated');
    return fetchSimulatedTideData(lat, lng, daysOffset);
    
  } catch (error) {
    console.error('❌ Error fetching MeteoSIX tide data:', error);
    console.log('Falling back to simulated tide data');
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
}

// ============================================
// SIMULATED TIDE DATA (FALLBACK)
// ============================================

function fetchSimulatedTideData(lat: number, lng: number, daysOffset: number): TideData | null {
  console.log('⚠️ Using SIMULATED tide data (fallback)');
  
  try {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysOffset);
    const todayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    const extremes: TideEvent[] = [];
    
    // Lunar phase based calculation
    const daysSinceNewMoon = ((targetDate.getTime() / (1000 * 60 * 60 * 24)) % 29.53);
    const locationFactor = ((lat + 90) / 180 + (lng + 180) / 360) / 2;
    const baseOffset = (daysSinceNewMoon / 29.53) * 24 + locationFactor * 6;
    
    // Generate 4 tide events (2 high, 2 low)
    for (let i = 0; i < 4; i++) {
      const hourOffset = baseOffset + (i * 6.2);
      const eventTime = new Date(todayStart.getTime() + hourOffset * 60 * 60 * 1000);
      const isHigh = i % 2 === 0;
      
      const baseHeight = 2.5;
      const variation = 1.5;
      const height = isHigh ? baseHeight + variation : baseHeight - variation;
      
      if (eventTime.getDate() === targetDate.getDate() && 
          eventTime.getMonth() === targetDate.getMonth()) {
        extremes.push({
          time: eventTime.toISOString(),
          type: isHigh ? 'high' : 'low',
          height: parseFloat(height.toFixed(2))
        });
      }
    }
    
    extremes.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error generating simulated tide data:', error);
    return null;
  }
}

// ============================================
// MAIN FETCH FUNCTION
// ============================================

export const fetchTideData = async (lat: number, lng: number, provider: TideProvider, daysOffset: number = 0): Promise<TideData | null> => {
  // If provider is 'none', return null
  if (provider === 'none') {
    console.log('Tide provider set to "none" - skipping tide data');
    return null;
  }

  console.log(`🌊 Fetching tide data with provider: ${provider}`);

  try {
    switch (provider) {
      case 'opentide':
        return await fetchWorldTidesData(lat, lng, daysOffset);
      
      case 'noaa':
        return await fetchNOAATideData(lat, lng, daysOffset);
      
      case 'puertos':
        return await fetchPuertosData(lat, lng, daysOffset);
      
      case 'meteosix':
        return await fetchMeteoSixTideData(lat, lng, daysOffset);
      
      default:
        console.warn(`Unknown provider: ${provider}, using simulated data`);
        return fetchSimulatedTideData(lat, lng, daysOffset);
    }
  } catch (error) {
    console.error('Error in fetchTideData:', error);
    return fetchSimulatedTideData(lat, lng, daysOffset);
  }
};
