export type Units = 'metric' | 'imperial';
export type TideProvider = 'none' | 'opentide' | 'puertos' | 'noaa' | 'meteosix';
export type WaveProvider = 'open-meteo' | 'meteosix';
export type WeatherProvider = 'open-meteo' | 'meteosix';
export type Language = 'es' | 'en';

export interface Settings {
  units: Units;
  tideProvider: TideProvider;
  waveProvider: WaveProvider;
  weatherProvider: WeatherProvider;
  language: Language;
  darkMode: boolean;
  notifyTides: boolean;
}
