interface TideEvent {
  time: string;
  type: 'high' | 'low';
  height: number;
}

interface TideData {
  extremes: TideEvent[];
  date: string;
}

// API de mareas usando cálculos astronómicos simplificados
// Para producción: integrar API real (WorldTides, NOAA, Puertos del Estado)
export const fetchTideData = async (_lat: number, _lng: number, _provider: string, daysOffset: number = 0): Promise<TideData | null> => {
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
    const baseOffset = (daysSinceNewMoon / 29.53) * 24; // Offset basado en fase lunar
    
    // Generar 4 eventos de marea (2 altas, 2 bajas)
    for (let i = 0; i < 4; i++) {
      const hourOffset = baseOffset + (i * 6.2); // ~6.2 horas entre cada evento
      const eventTime = new Date(todayStart.getTime() + hourOffset * 60 * 60 * 1000);
      
      // Alternar entre alta y baja
      const isHigh = i % 2 === 0;
      
      // Altura de marea simulada (metros)
      const baseHeight = 2.5;
      const variation = 1.5;
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
