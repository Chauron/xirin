# Xirin Marine App - Arquitectura Técnica

## 📋 Resumen del Proyecto

Xirin es una aplicación multiplataforma para pescadores y navegantes que permite gestionar marcadores en un mapa, registrar capturas con datos meteorológicos asociados, y visualizar condiciones del mar en tiempo real.

## 🏗️ Stack Tecnológico

### Frontend Framework
- **React 19** con TypeScript
- **Vite** como build tool
- **Capacitor** para compilación nativa (Android/iOS)

### UI Framework
- **Material-UI (MUI) v7** - Componentes de interfaz
- **React Leaflet** - Mapas interactivos con OpenStreetMap
- **Recharts** - Gráficas y visualizaciones

### Estado y Persistencia
- **Zustand** - Gestión de estado global (ligero, sin boilerplate)
- **Dexie.js** - Wrapper sobre IndexedDB para base de datos local
- Sincronización opcional con backend (preparado para futuro)

### APIs Externas (Gratuitas)
- **Open-Meteo Marine API** - Datos de oleaje, altura ola, periodo, dirección
- **Open-Meteo Weather API** - Temperatura, viento, humedad, presión, nubes
- Extensible a NOAA, AEMET o APIs de mareas

### Routing y Navegación
- **React Router v7** - Navegación entre pantallas
- Bottom navigation con MUI para acceso rápido

## 📁 Estructura del Proyecto

```
map-app/
├── src/
│   ├── api/                    # Integración con APIs externas
│   │   └── weatherApi.ts       # Open-Meteo Weather & Marine
│   ├── components/             # Componentes reutilizables
│   │   ├── Layout.tsx          # Layout principal con bottom nav
│   │   ├── MapView.tsx         # (legacy, reemplazar)
│   │   └── PointsList.tsx      # (legacy, reemplazar)
│   ├── db/                     # Capa de persistencia
│   │   └── db.ts               # Configuración Dexie/IndexedDB
│   ├── models/                 # Tipos TypeScript
│   │   └── types.ts            # Spot, Catch, WeatherConditions
│   ├── pages/                  # Pantallas de la app
│   │   ├── MapPage.tsx         # Mapa interactivo + añadir spots
│   │   ├── SpotDetailsPage.tsx # Detalle spot + weather + gráficas
│   │   ├── AddCatchPage.tsx    # Formulario captura + foto
│   │   ├── CatchesPage.tsx     # Listado histórico capturas
│   │   └── SettingsPage.tsx    # Configuración app
│   ├── store/                  # Estado global
│   │   └── useAppStore.ts      # Store Zustand (spots + catches)
│   ├── utils/                  # Utilidades (vacío por ahora)
│   ├── App.tsx                 # Router principal
│   └── main.tsx                # Entry point
├── android/                    # Proyecto Android nativo
├── public/                     # Assets públicos
├── capacitor.config.json       # Configuración Capacitor
├── package.json
└── tsconfig.json
```

## 🗂️ Modelo de Datos

### Spot (Marcador)
```typescript
interface Spot {
  id?: number;
  name: string;
  description: string;
  location: { lat: number; lng: number };
  type: 'fishing' | 'anchoring' | 'sailing' | 'observation' | 'other';
  createdAt: Date;
  updatedAt: Date;
}
```

### Catch (Captura)
```typescript
interface Catch {
  id?: number;
  spotId: number;           // FK al spot
  date: Date;
  species: string;
  weight?: number;
  photoUrl?: string;        // URI local de la foto
  weather: WeatherConditions; // Snapshot del clima en el momento
  notes?: string;
}
```

### WeatherConditions
```typescript
interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
  pressure?: number;
  cloudCover?: number;
  tideType?: 'high' | 'low' | 'rising' | 'falling';
}
```

## 🔄 Flujos Principales

### 1. Añadir Marcador
1. Usuario pulsa en el mapa (`MapPage`)
2. Se abre dialog con formulario (nombre, descripción, tipo)
3. Se guarda en IndexedDB vía Zustand
4. Marcador aparece en el mapa

### 2. Ver Detalles de Spot
1. Usuario pulsa marcador → navega a `/spot/:id`
2. `SpotDetailsPage` carga spot desde store
3. Llama APIs de Open-Meteo (weather + marine)
4. Muestra estado actual + gráficas 24h (temp, viento, olas)
5. Botón "Añadir Captura" → `/add-catch/:spotId`

### 3. Registrar Captura
1. Desde `SpotDetailsPage`, botón "Añadir Captura"
2. `AddCatchPage` permite:
   - Tomar foto con cámara (Capacitor Camera API)
   - Ingresar especie, peso, notas
3. Al guardar:
   - Captura condiciones meteorológicas actuales (API call)
   - Almacena todo en IndexedDB
4. Vuelve a listado o spot

### 4. Historial de Capturas
1. Bottom nav → "Capturas" → `CatchesPage`
2. Lista todas las capturas con foto, spot, fecha, condiciones
3. Filtros futuros: por spot, especie, fecha, clima

## 🌐 Integración con APIs

### Open-Meteo Weather API
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Parámetros**:
  - `latitude`, `longitude`
  - `current`: temperatura, viento, código climático
  - `hourly`: temp, humedad, viento, presión, nubes
  - `forecast_days`: 1-7 días
- **Rate limit**: Sin límite (uso razonable)

### Open-Meteo Marine API
- **URL**: `https://marine-api.open-meteo.com/v1/marine`
- **Parámetros**:
  - `latitude`, `longitude`
  - `hourly`: wave_height, wave_direction, wave_period
  - `forecast_days`: 1-3 días
- **Cobertura**: Océanos y mares principales

### Caché y Manejo de Errores
- **Sin caché implementado** (opcional futuro: guardar último fetch en IndexedDB)
- **Timeout**: Axios default (sin configurar aún)
- **Reintentos**: No implementado (opcional futuro)

## 🎨 Decisiones de Diseño

### ¿Por qué Zustand?
- Más ligero que Redux (~1KB vs ~40KB)
- API simple, sin boilerplate
- Perfecto para apps de tamaño pequeño-mediano
- Fácil integración con TypeScript

### ¿Por qué Dexie?
- Wrapper sobre IndexedDB con API moderna (Promise-based)
- Soporte para queries complejas
- Sincronización offline-first
- Observables para React

### ¿Por qué Leaflet?
- Gratis, open-source
- No requiere API key (usa OpenStreetMap)
- Ligero y rápido
- Alternativa: Google Maps (requiere billing)

### ¿Por qué MUI v7?
- Sistema de diseño completo
- Accesibilidad built-in
- Tematización avanzada
- Amplia comunidad

## 📱 Capacitor: Funcionalidades Nativas

### Camera API
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri
});
```

### Geolocation API (preparado)
```typescript
import { Geolocation } from '@capacitor/geolocation';

const position = await Geolocation.getCurrentPosition();
// Usar para centrar mapa en ubicación actual
```

## 🚀 Build y Deploy

### Desarrollo Local
```bash
npm run dev           # Vite dev server (localhost:5173)
```

### Build Web
```bash
npm run build         # Output en dist/
npm run preview       # Preview del build
```

### Build Android
```bash
npm run build
npx cap sync          # Copia build a android/
npx cap open android  # Abre Android Studio
# Build APK/AAB desde Android Studio
```

### Build iOS (macOS requerido)
```bash
npm run build
npx cap sync
npx cap open ios      # Abre Xcode
# Build desde Xcode
```

## 🧪 Testing (Pendiente)

### Propuesta
- **Unit tests**: Vitest (sucesor de Jest)
- **Component tests**: React Testing Library
- **E2E**: Playwright o Cypress

### Áreas críticas a testear
- Store actions (addSpot, addCatch)
- API calls (mocks)
- Formularios (validaciones)

## 🔮 Roadmap Futuro

### Fase 1: MVP Completo ✅
- [x] CRUD marcadores
- [x] CRUD capturas con fotos
- [x] Integración API clima/mar
- [x] Gráficas básicas

### Fase 2: Mejoras UX
- [ ] Caché de datos API (offline-first)
- [ ] Filtros avanzados en capturas
- [ ] Estadísticas (capturas por spot, clima, luna)
- [ ] Exportar datos (CSV/JSON)

### Fase 3: Features Avanzadas
- [ ] Backend opcional (sincronización multi-dispositivo)
- [ ] Notificaciones push (condiciones óptimas)
- [ ] Predicción de mareas (API adicional)
- [ ] Modo oscuro completo
- [ ] Internacionalización (i18n)

### Fase 4: Optimización
- [ ] Service Worker (PWA)
- [ ] Lazy loading de rutas
- [ ] Compresión de imágenes
- [ ] Tests automatizados

## 📚 Recursos y Referencias

- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Leaflet](https://react-leaflet.js.org/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Dexie.js](https://dexie.org/)
- [MUI Components](https://mui.com/material-ui/getting-started/)

## 🤝 Contribuir

### Setup
```bash
git clone <repo>
cd map-app
npm install
npm run dev
```

### Convenciones
- Commits: Conventional Commits
- Branches: `feature/`, `bugfix/`, `hotfix/`
- PRs: Descripción detallada + screenshots

## 📝 Notas Técnicas

### TypeScript Strict Mode
- `verbatimModuleSyntax`: true → Usar `type` imports
- Sin `any` permitido (salvo casos justificados)

### Performance
- IndexedDB es asíncrono (no bloquea UI)
- React Leaflet usa memoization interna
- Recharts optimizado para datasets < 1000 puntos

### Limitaciones Actuales
- Sin backend → datos solo locales
- Sin autenticación → un dispositivo = una cuenta
- Mareas: no implementadas (falta API)
- Notificaciones: no implementadas

---

**Versión**: 0.1.0  
**Última actualización**: Noviembre 2025  
**Autor**: Xirin Development Team
