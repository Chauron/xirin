export interface GeoLocation {
  lat: number;
  lng: number;
}

export type SpotType = 'fishing' | 'anchoring' | 'sailing' | 'observation' | 'other';

export interface Spot {
  id?: number;
  name: string;
  description: string;
  location: GeoLocation;
  type: SpotType;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
  pressure?: number;
  cloudCover?: number;
  tideType?: 'high' | 'low' | 'rising' | 'falling';
  tideHeight?: number;
}

export interface TideEvent {
  time: string;
  type: 'high' | 'low';
  height: number;
}

export interface HourlyWeatherData {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure?: number;
  cloudCover?: number;
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
}

export interface Catch {
  id?: number;
  spotId: number;
  date: Date;
  species: string;
  weight?: number;
  photoUrl?: string;
  weather: WeatherConditions;
  notes?: string;
  hourlyWeather?: HourlyWeatherData[];
  tideEvents?: TideEvent[];
}

export interface WeatherData {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wave_height?: number[];
  wave_period?: number[];
  wave_direction?: number[];
}
