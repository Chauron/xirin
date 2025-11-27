import { fetchMarineWeather } from './weatherApi';

export const fetchWaveData = async (lat: number, lng: number, provider: string) => {
  if (provider === 'open-meteo') {
    return await fetchMarineWeather(lat, lng);
  }
  // Futuro: añadir lógica para otros proveedores (puertos, noaa...)
  // if (provider === 'puertos') { ... }
  // if (provider === 'noaa') { ... }
  return null;
};
