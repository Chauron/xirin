# 🧭 Información sobre Mapas Náuticos

## Situación Actual

La app actualmente utiliza **OpenSeaMap** como capa náutica, que es gratuita y de código abierto. Sin embargo, esta capa tiene limitaciones importantes:

### ✅ Lo que OpenSeaMap proporciona:
- Balizas, boyas y marcas de navegación
- Faros y señales luminosas
- Límites de puertos y marinas
- Algunas restricciones de navegación

### ❌ Lo que OpenSeaMap NO proporciona:
- **Batimetría detallada** (profundidades)
- Curvas isobáticas (líneas de profundidad)
- Tipo de fondo marino
- Peligros submarinos detallados
- Información de calados en puertos

## Alternativas de Mapas Náuticos Profesionales

### 🔐 Servicios de Pago (Calidad Profesional)
Estos servicios ofrecen batimetría detallada como Navionics:

1. **Navionics** (https://www.navionics.com/)
   - Requiere suscripción (~€15-50/año)
   - API comercial disponible
   - Batimetría de alta resolución
   - Actualización continua

2. **C-MAP** (https://www.c-map.com/)
   - Alternativa profesional a Navionics
   - Cobertura mundial
   - Requiere licencia comercial

3. **OpenCPN + Chart Sources**
   - Software libre, pero las cartas siguen siendo de pago
   - Descarga de cartas oficiales (SHOM, IHO, etc.)

### 🆓 Opciones Gratuitas con Limitaciones

1. **NOAA Nautical Charts** (Solo USA)
   - URL: `https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png`
   - Limitación: Solo aguas territoriales de EE.UU.
   - Incluye batimetría oficial

2. **ENC (Electronic Navigational Charts) - OpenStreetMap base**
   - Capa actual que usamos
   - Limitaciones mencionadas arriba

3. **Batimetría GEBCO** (Global)
   - Datos de batimetría global
   - Baja resolución (adecuada para océano abierto, no para costas)
   - URL: Requiere procesamiento de datos ráster

## Implementación Actual

La app ahora tiene **3 capas de mapa**:

```typescript
1. Mapa Estándar: OpenStreetMap (calles, carreteras, referencias terrestres)
2. Vista Satélite: Esri World Imagery (imágenes satelitales reales)
3. Carta Náutica: OpenStreetMap base + OpenSeaMap overlay
```

### Vista Satélite como Alternativa
La vista satélite es útil porque:
- ✅ Muestra la **línea de costa real**
- ✅ Identifica **zonas rocosas vs. playas**
- ✅ Muestra **estructuras portuarias**
- ✅ Permite ver **arrecifes visibles** y bajíos
- ✅ Útil para **fondeo en calas**

## Recomendaciones

### Para Uso Costero Recreativo:
- **Vista Satélite** + conocimiento local
- **OpenSeaMap** para referencias de navegación (boyas, faros)
- Apps complementarias: Navionics o similares para planificación

### Para Navegación Profesional:
Sería necesario:
1. Suscripción a servicio comercial (Navionics, C-MAP)
2. Integración de su API en la aplicación
3. Costes recurrentes por usuario

### Solución Híbrida (Futura):
1. Permitir a usuarios **importar cartas náuticas** propias (formato `.mbtiles`)
2. Integración con **OpenCPN** para descargar cartas oficiales
3. Sistema de **caché local** de tiles náuticos comprados

## Próximos Pasos Recomendados

Si necesitas batimetría detallada, las opciones son:

### Opción A: API de Pago (Más profesional)
```javascript
// Navionics Sonar Charts API (requiere licencia)
https://api.navionics.com/...
```

### Opción B: Tiles NOAA (Solo USA, Gratis)
```javascript
// Ya está preparado el código, solo cambiar región
<TileLayer
  url="https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png"
  attribution='NOAA Nautical Charts'
/>
```

### Opción C: Descarga Manual de Cartas
Permitir a usuarios:
1. Descargar cartas oficiales de su región (SHOM, IHM, etc.)
2. Convertir a formato `.mbtiles`
3. Cargar en la app localmente

## Conclusión

Para una experiencia tipo **Navionics completa**, se requiere:
- 💰 Presupuesto para suscripción API (~$100-500/mes)
- 📜 Acuerdo comercial con proveedores
- 🔧 Integración técnica de su API

La solución actual con **OpenSeaMap + Vista Satélite** es la mejor opción gratuita disponible, adecuada para:
- Pesca recreativa costera
- Marcado de puntos de pesca
- Referencia de estructuras portuarias
- Visualización de zonas de fondeo

Para navegación seria, se recomienda usar apps especializadas (Navionics, iNavX, etc.) junto con Xirin para el registro de capturas.
