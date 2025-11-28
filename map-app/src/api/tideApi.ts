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
export type TideProvider = 'none' | 'opentide' | 'puertos' | 'noaa';

// API de mareas usando cálculos astronómicos simplificados
// Para producción: integrar API real (OpenTide, NOAA, Puertos del Estado)
export const fetchTideData = async (lat: number, lng: number, provider: TideProvider, daysOffset: number = 0): Promise<TideData | null> => {
  // If provider is 'none', return null
  if (provider === 'none') {
    return null;
  }

  // For now, all providers use the demo/synthetic data
  // In production, implement actual API calls for each provider
  // Example: 
  // - opentide: OpenTide API or similar
  // - noaa: NOAA CO-OPS API (free, US locations)
  // - puertos: Puertos del Estado API (Spain)
  
  try {
    // Para demo, vamos a generar datos sintéticos basados en cálculos astronómicos simples
    // En producción, usar una API real de mareas
    
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysOffset);
    const todayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    // Calcular fases lunares aproximadas para mareas (simplificado)
    // Las mareas siguen un ciclo de ~12.4 horas (2 pleamares y 2 bajamares por día)
    const extremes: TideEvent[] = [];
    
    // Calcular hora aproximada de la primera marea alta del día
    // Esto es una simplificación - las mareas reales dependen de la fase lunar y geografía
    const daysSinceNewMoon = ((targetDate.getTime() / (1000 * 60 * 60 * 24)) % 29.53);
    // Add some variation based on location (lat/lng)
    const locationFactor = ((lat + 90) / 180 + (lng + 180) / 360) / 2;
    const baseOffset = (daysSinceNewMoon / 29.53) * 24 + locationFactor * 6; // Offset basado en fase lunar y ubicación
    
    // Generar 4 eventos de marea (2 altas, 2 bajas)
    for (let i = 0; i < 4; i++) {
      const hourOffset = baseOffset + (i * 6.2); // ~6.2 horas entre cada evento
      const eventTime = new Date(todayStart.getTime() + hourOffset * 60 * 60 * 1000);
      
      // Alternar entre alta y baja
      const isHigh = i % 2 === 0;
      
      // Altura de marea simulada (metros)
      // Vary tide height based on provider (for demo purposes)
      const providerMultiplier = provider === 'opentide' ? 1.2 : provider === 'noaa' ? 1.0 : 0.8;
      const baseHeight = 2.5 * providerMultiplier;
      const variation = 1.5 * providerMultiplier;
      const height = isHigh 
        ? baseHeight + variation 
        : baseHeight - variation;
      
      if (eventTime.getDate() === targetDate.getDate() && 
          eventTime.getMonth() === targetDate.getMonth()) {
        extremes.push({
          time: eventTime.toISOString(),
          type: isHigh ? 'high' : 'low',
          height: parseFloat(height.toFixed(2))
        });
      }
    }
    
    // Ordenar por tiempo
    extremes.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching tide data:', error);
    return null;
  }
};
