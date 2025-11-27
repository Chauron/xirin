import { fetchWeatherForecast } from './weatherApi';

export const fetchTideData = async (lat: number, lng: number, provider: string) => {
  // Futuro: lógica para OpenTidePrediction, Puertos del Estado, NOAA
  // if (provider === 'opentide') { ... }
  // if (provider === 'puertos') { ... }
  // if (provider === 'noaa') { ... }
  // Por ahora, devolver null
  return null;
};
