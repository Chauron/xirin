# Integración de APIs Reales de Mareas

## Estado Actual
- ✅ **Meteorología**: DATOS REALES de Open-Meteo API (gratuita, sin API key)
- ⚠️ **Mareas**: DATOS SIMULADOS (calculados astronómicamente)

## APIs Reales de Mareas Disponibles

### 1. WorldTides API (Recomendado - Cobertura Global) 🌍
**Website**: https://www.worldtides.info/
- **Costo**: ~$10/mes (1000 requests)
- **Cobertura**: Global (todos los océanos)
- **Datos**: Extremos de marea, alturas, corrientes

**Ejemplo de implementación**:
```typescript
export const fetchTideDataWorldTides = async (
  lat: number, 
  lng: number, 
  daysOffset: number = 0
): Promise<TideData | null> => {
  const apiKey = 'TU_API_KEY_AQUI'; // Obtener en worldtides.info
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysOffset);
  
  const start = Math.floor(targetDate.getTime() / 1000);
  const end = start + 86400; // +24 horas
  
  try {
    const response = await axios.get('https://www.worldtides.info/api/v3', {
      params: {
        extremes: true,
        heights: false,
        lat,
        lon: lng,
        start,
        length: 86400,
        key: apiKey
      }
    });
    
    const extremes: TideEvent[] = response.data.extremes.map((e: any) => ({
      time: new Date(e.dt * 1000).toISOString(),
      type: e.type === 'High' ? 'high' : 'low',
      height: e.height
    }));
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching WorldTides data:', error);
    return null;
  }
};
```

### 2. NOAA CO-OPS API (Gratis - Solo USA) 🇺🇸
**Website**: https://tidesandcurrents.noaa.gov/api/
- **Costo**: GRATIS
- **Cobertura**: Solo estaciones en USA
- **Limitación**: Necesitas encontrar la estación más cercana primero

**Ejemplo de implementación**:
```typescript
// Primero necesitas un mapa de estaciones NOAA
// Ejemplo: San Francisco = Station ID 9414290

export const fetchTideDataNOAA = async (
  stationId: string,
  daysOffset: number = 0
): Promise<TideData | null> => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysOffset);
  const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '');
  
  try {
    const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      params: {
        product: 'predictions',
        application: 'XirinMarine',
        begin_date: dateStr,
        range: 24,
        datum: 'MLLW',
        station: stationId,
        time_zone: 'gmt',
        units: 'metric',
        interval: 'hilo', // High/Low only
        format: 'json'
      }
    });
    
    const extremes: TideEvent[] = response.data.predictions.map((p: any) => ({
      time: new Date(p.t).toISOString(),
      type: p.type === 'H' ? 'high' : 'low',
      height: parseFloat(p.v)
    }));
    
    return {
      extremes,
      date: targetDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching NOAA tide data:', error);
    return null;
  }
};
```

### 3. Puertos del Estado API (Gratis - Solo España) 🇪🇸
**Website**: https://www.puertos.es/es-es/oceanografia/Paginas/portus.aspx
- **Costo**: GRATIS
- **Cobertura**: Puertos españoles
- **API**: Requiere registro para acceso

**Ejemplo de implementación**:
```typescript
// Necesitas registrarte en Puertos del Estado para obtener acceso
// La API proporciona datos de mareas, oleaje y meteorología

export const fetchTideDataPuertos = async (
  puertoId: string,
  daysOffset: number = 0
): Promise<TideData | null> => {
  // Implementación depende de la documentación oficial de Puertos del Estado
  // Contactar: oceanografia@puertos.es
  
  try {
    // TODO: Implementar según documentación oficial
    console.log('Puertos del Estado API - Pendiente de implementación');
    return null;
  } catch (error) {
    console.error('Error fetching Puertos data:', error);
    return null;
  }
};
```

### 4. Tide-API (Gratis - Limitado) 🆓
**Website**: https://github.com/nstratton/tide-api
- **Costo**: GRATIS (self-hosted o servicio público limitado)
- **Cobertura**: Variable según fuente de datos
- **Nota**: Requiere configurar tu propio servidor

## Recomendación

### Para Producción Seria:
**WorldTides API** - Vale los $10/mes por:
- Cobertura global completa
- API confiable y bien documentada
- Sin necesidad de gestionar estaciones
- Datos precisos y actualizados

### Para Testing/Demo:
**Simulación Actual** - Aceptable para:
- Desarrollo y pruebas
- Demo de la aplicación
- Visualización de UI

### Si tu target es España:
**Puertos del Estado** - Ideal porque:
- Es gratis
- Datos oficiales españoles
- Cobertura de todos los puertos principales

## Cómo Cambiar de Simulado a Real

1. **Elige tu proveedor** y obtén API key (si necesario)
2. **Implementa la función** correspondiente en `tideApi.ts`
3. **Modifica `fetchTideData`** para llamar a la función real:

```typescript
export const fetchTideData = async (...) => {
  if (provider === 'none') return null;
  
  switch (provider) {
    case 'opentide':
      return await fetchTideDataWorldTides(lat, lng, daysOffset);
    case 'noaa':
      // Necesitas mapear lat/lng a station ID primero
      const stationId = findNearestNOAAStation(lat, lng);
      return await fetchTideDataNOAA(stationId, daysOffset);
    case 'puertos':
      const puertoId = findNearestPuerto(lat, lng);
      return await fetchTideDataPuertos(puertoId, daysOffset);
    default:
      // Fallback a simulación
      return await fetchSimulatedTideData(lat, lng, daysOffset);
  }
};
```

## Variables de Entorno

Añade a `.env`:
```env
VITE_WORLDTIDES_API_KEY=tu_api_key_aqui
VITE_NOAA_APP_NAME=XirinMarine
```

Y úsalas en el código:
```typescript
const apiKey = import.meta.env.VITE_WORLDTIDES_API_KEY;
```
