export type Units = 'metric' | 'imperial';
export type TideProvider = 'none' | 'opentide' | 'puertos' | 'noaa';
export type WaveProvider = 'open-meteo' | 'puertos' | 'noaa';
export type Language = 'es' | 'en';

export interface Settings {
  units: Units;
  tideProvider: TideProvider;
  waveProvider: WaveProvider;
  language: Language;
  darkMode: boolean;
  notifyTides: boolean;
}
