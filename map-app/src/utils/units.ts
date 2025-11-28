export type Units = 'metric' | 'imperial';

// Temperature conversions
export const convertTemperature = (celsius: number, units: Units): number => {
  if (units === 'imperial') {
    return (celsius * 9/5) + 32;
  }
  return celsius;
};

export const getTemperatureUnit = (units: Units): string => {
  return units === 'imperial' ? '°F' : '°C';
};

// Speed conversions (km/h <-> mph)
export const convertSpeed = (kmh: number, units: Units): number => {
  if (units === 'imperial') {
    return kmh * 0.621371;
  }
  return kmh;
};

export const getSpeedUnit = (units: Units): string => {
  return units === 'imperial' ? 'mph' : 'km/h';
};

// Distance conversions (meters <-> feet)
export const convertDistance = (meters: number, units: Units): number => {
  if (units === 'imperial') {
    return meters * 3.28084;
  }
  return meters;
};

export const getDistanceUnit = (units: Units): string => {
  return units === 'imperial' ? 'ft' : 'm';
};

// Wave height conversions (meters <-> feet)
export const convertWaveHeight = (meters: number, units: Units): number => {
  return convertDistance(meters, units);
};

export const getWaveHeightUnit = (units: Units): string => {
  return getDistanceUnit(units);
};

// Weight conversions (kg <-> lbs)
export const convertWeight = (kg: number, units: Units): number => {
  if (units === 'imperial') {
    return kg * 2.20462;
  }
  return kg;
};

export const getWeightUnit = (units: Units): string => {
  return units === 'imperial' ? 'lbs' : 'kg';
};

// Pressure conversions (hPa is standard, both systems use it)
export const getPressureUnit = (): string => {
  return 'hPa';
};

// Format number with appropriate decimal places
export const formatValue = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '-';
  }
  return value.toFixed(decimals);
};
