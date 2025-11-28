# 🌊 Configuración de MeteoSIX (MeteoGalicia)

## ¿Qué es MeteoSIX?

MeteoSIX es la **API oficial de MeteoGalicia** que proporciona datos meteorológicos y oceanográficos de alta resolución para Galicia y aguas adyacentes.

## Ventajas sobre otras APIs

### Para usuarios en Galicia:

✅ **Resolución superior**: Mallas de 1km vs 11km de APIs globales  
✅ **Modelos regionales**: Optimizados específicamente para Galicia  
✅ **Datos de mareas**: Predicciones para 15 puertos gallegos  
✅ **Gratis**: Sin coste, solo requiere registro  
✅ **Oficial**: Datos de la Xunta de Galicia  

### Modelos disponibles:

- **WRF**: Predicción meteorológica (temperatura, viento, precipitación, nieve)
- **WW3**: Oleaje océano Atlántico
- **SWAN**: Oleaje costa (alta resolución)
- **ROMS**: Corrientes marinas y temperatura del agua
- **MOHID**: Rías de Arousa, Vigo y A Coruña (ultra alta resolución)
- **Mareas**: 15 puertos de referencia

## Cobertura Geográfica

### Área de Cobertura
- **Latitud**: 41.5°N a 44.0°N
- **Longitud**: -9.5°W a -6.5°W

### Incluye:
- ✅ Toda Galicia
- ✅ Norte de Portugal (costa)
- ✅ Aguas territoriales gallegas
- ✅ Parte del Golfo de Vizcaya

### Puertos con datos de mareas:
1. A Coruña
2. Ferrol (interior y exterior)
3. Ría de Corme
4. Ría de Camariñas
5. Corcubión
6. Ría de Foz
7. Muros
8. Ribeira
9. Vilagarcía
10. Pontevedra
11. Marín
12. Vigo
13. A Guarda

## Configuración paso a paso

### 1. Solicitar API Key (GRATIS)

1. Visita: https://www.meteogalicia.gal/web/apiv5/solicitude-de-uso-da-api
2. Rellena el formulario con:
   - Nombre y apellidos
   - Email (recibirás la API key aquí)
   - Descripción del uso (ej: "Aplicación móvil para pescadores")
3. Recibirás un email con tu **API_KEY**

### 2. Configurar la aplicación

#### Opción A: Archivo .env (Recomendado)

1. En la carpeta `map-app/`, crea un archivo `.env` si no existe
2. Copia el contenido de `.env.example`
3. Añade tu API key:

```bash
VITE_METEOSIX_API_KEY=tu_api_key_aqui
```

4. Guarda el archivo

#### Opción B: Variable de entorno del sistema

```bash
# Windows (PowerShell)
$env:VITE_METEOSIX_API_KEY="tu_api_key_aqui"

# macOS/Linux
export VITE_METEOSIX_API_KEY="tu_api_key_aqui"
```

### 3. Activar en la aplicación

1. Abre la app
2. Ve a **⚙️ Ajustes**
3. En **Proveedor de Mareas**, selecciona **🌊 MeteoSIX (Galicia)**
4. En **Proveedor de Oleaje**, selecciona **🌊 MeteoSIX (Galicia)** (opcional)

### 4. Verificar funcionamiento

1. Crea o selecciona un punto en la costa gallega
2. Verifica en la consola del navegador (F12):
   ```
   ✅ MeteoSIX weather data received
   ✅ MeteoSIX marine data received
   ✅ MeteoSIX tide data received: X events
   ```

## Comportamiento de la aplicación

### Uso automático por ubicación

La app detecta automáticamente si estás en Galicia:

```
📍 Location within Galicia - trying MeteoSIX API first
✅ Using REAL weather data from MeteoSIX (high resolution)
```

Si estás **fuera de Galicia**, usa automáticamente Open-Meteo:

```
📍 Location outside MeteoSIX coverage area
Fetching REAL weather data from Open-Meteo for: X, Y
```

### Fallback automático

Si MeteoSIX falla, la app continúa funcionando con Open-Meteo:

1. Intenta MeteoSIX (si estás en Galicia y tienes API key)
2. Si falla → Open-Meteo (global)
3. Si falla → Datos simulados (mareas astronómicas)

**La app NUNCA se cuelga por falta de datos.**

## Datos proporcionados

### Tiempo (WRF)
- Temperatura del aire
- Viento (velocidad, ráfagas, dirección)
- Precipitación acumulada
- Humedad relativa
- Presión atmosférica
- Cobertura de nubes
- Estado del cielo
- Cota de nieve

### Mar (WW3/SWAN)
- Altura significativa de ola
- Periodo de ola
- Dirección de ola

### Oceanografía (ROMS/MOHID)
- Temperatura del agua
- Salinidad
- Corrientes marinas

### Mareas (Puertos de referencia)
- Horas de pleamar y bajamar
- Alturas de marea
- Valores cada 30 minutos

## Frecuencia de actualización

- **WRF**: 2 ejecuciones diarias (00:00 y 12:00 UTC)
- **WW3/SWAN**: 2 ejecuciones diarias
- **ROMS/MOHID**: 1 ejecución diaria (00:00 UTC)
- **Mareas**: Predicciones hasta 60 días

## Horizonte de predicción

| Modelo | Horizonte |
|--------|-----------|
| WRF 1km | 96 horas (4 días) |
| WRF 4km | 96 horas (4 días) |
| WRF 12km | 96 horas (4 días) |
| WW3 | 109 horas (~5 días) |
| SWAN | 97 horas (~4 días) |
| ROMS | 97 horas (~4 días) |
| MOHID | 49 horas (~2 días) |

## Límites de uso

- **Rate limit**: No especificado oficialmente (uso razonable)
- **Requests simultáneos**: 20 localizaciones por petición
- **Sin coste** para uso no comercial

## Comparativa con otras APIs

| Característica | MeteoSIX | Open-Meteo | WorldTides | NOAA |
|----------------|----------|------------|------------|------|
| **Coste** | ✅ Gratis | ✅ Gratis | 💰 $10/mes | ✅ Gratis |
| **Resolución Galicia** | 🏆 1km | 11km | - | - |
| **Mareas Galicia** | ✅ 15 puertos | ❌ No | ✅ Global | ❌ Solo USA |
| **Oleaje** | ✅ SWAN | ✅ Global | ❌ No | ✅ USA |
| **Temperatura agua** | ✅ ROMS | ✅ Global | ❌ No | ✅ USA |
| **API Key** | ✅ Requerida | ❌ No | ✅ Requerida | ❌ No |

## Solución de problemas

### "⚠️ MeteoSIX API key not configured"
- **Causa**: No has añadido la API key en `.env`
- **Solución**: Sigue el paso 2 de configuración

### "❌ MeteoSIX API key invalid or expired"
- **Causa**: La API key es incorrecta o caducó
- **Solución**: Solicita una nueva en el portal de MeteoGalicia

### "📍 Location outside MeteoSIX coverage area"
- **Causa**: El punto está fuera de Galicia
- **Solución**: Normal, la app usará Open-Meteo automáticamente

### "📍 Point outside MeteoSIX marine coverage"
- **Causa**: El punto está muy lejos de la costa
- **Solución**: Normal para puntos tierra adentro

### "⚠️ No MeteoSIX tide data available"
- **Causa**: Muy lejos de puertos de referencia
- **Solución**: Usa otro proveedor de mareas (WorldTides o NOAA)

## Recursos adicionales

- **Documentación oficial**: https://www.meteogalicia.gal/web/apiv5/
- **Portal MeteoGalicia**: https://www.meteogalicia.gal/
- **Modelos numéricos**: https://www.meteogalicia.gal/web/modelos-numericos

## Contacto

Para soporte técnico sobre la API:
- Email: meteo@xunta.gal
- Teléfono: +34 981 541 040

## Licencia de datos

Los datos de MeteoSIX son proporcionados por MeteoGalicia (Xunta de Galicia) bajo licencia de uso libre para aplicaciones no comerciales. Respeta los términos de uso al solicitar tu API key.
