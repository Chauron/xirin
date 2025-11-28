# 🌊 Xirin Marine App

Aplicación multiplataforma para pescadores y navegantes que permite gestionar puntos de interés en mapas, registrar capturas con condiciones meteorológicas automáticas, y visualizar el estado del mar en tiempo real.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)

## ✨ Características

### 🗺️ Gestión de Marcadores
- Añadir puntos de interés pulsando directamente en el mapa
- Clasificar por tipo: pesca, fondeo, navegación, observación
- Editar y eliminar marcadores
- Visualización con OpenStreetMap (sin necesidad de API key)

### 🌤️ Estado del Mar y Tiempo
- **Datos en tiempo real** para cada marcador:
  - Temperatura, humedad, presión atmosférica
  - Viento (velocidad, ráfagas, dirección)
  - Oleaje (altura, periodo, dirección)
  - Nubosidad y visibilidad
- **Gráficas de evolución** 24h/3 días
- Integración con APIs gratuitas (Open-Meteo)

### 🐟 Registro de Capturas
- Foto desde cámara o galería
- Asociación automática con marcador y condiciones meteorológicas
- Datos guardados:
  - Especie, peso, fecha/hora
  - Condiciones del mar en el momento exacto
  - Notas adicionales
- Historial completo con filtros

### 📊 Visualización y Estadísticas
- Listado de capturas con fotos y condiciones
- Filtros por marcador, especie, fecha
- Estadísticas básicas (futuro: capturas por luna, clima óptimo)

### ⚙️ Configuración
- Unidades métricas/imperiales
- Notificaciones de mareas (futuro)
- Modo oscuro (futuro)

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ y npm
- Para Android: Android Studio + JDK 17
- Para iOS: macOS + Xcode

### Setup del Proyecto
```bash
# Clonar repositorio
git clone https://github.com/Chauron/xirin.git
cd xirin/map-app

# Instalar dependencias
npm install

# Ejecutar en desarrollo (web)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Android
```bash
# 1. Build del proyecto web
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. Desde Android Studio:
#    - Build > Build Bundle(s) / APK(s) > Build APK
#    - O ejecutar en emulador/dispositivo
```

### Build para iOS (macOS)
```bash
npm run build
npx cap sync ios
npx cap open ios
# Compilar desde Xcode
```

## 📦 Stack Tecnológico

| Categoría | Tecnología | Justificación |
|-----------|-----------|---------------|
| **Framework** | React 19 + TypeScript | Tipado fuerte, mejor DX |
| **Build Tool** | Vite | Rápido, HMR instantáneo |
| **UI** | Material-UI v7 | Componentes completos, accesibles |
| **Mapas** | React Leaflet + OpenStreetMap | Gratis, sin API key |
| **Estado** | Zustand | Ligero, sin boilerplate |
| **DB Local** | Dexie.js (IndexedDB) | Offline-first, queries avanzadas |
| **Charts** | Recharts | Ligero, responsive |
| **APIs** | Open-Meteo (Weather + Marine) | Gratuitas, sin rate limits estrictos |
| **Nativo** | Capacitor | Acceso a cámara, geolocalización |

## 📱 Capturas de Pantalla

*(Pendiente: añadir screenshots cuando la UI esté pulida)*

## 🗂️ Estructura del Proyecto

```
map-app/
├── src/
│   ├── api/           # Integración APIs externas
│   ├── components/    # Componentes reutilizables
│   ├── db/            # Configuración IndexedDB
│   ├── models/        # Tipos TypeScript
│   ├── pages/         # Pantallas de la app
│   ├── store/         # Estado global (Zustand)
│   └── utils/         # Utilidades
├── android/           # Proyecto Android nativo
├── public/            # Assets estáticos
└── capacitor.config.json
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles técnicos completos.

## 🧭 Navegación

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Mapa | `/` | Mapa interactivo con marcadores |
| Detalle Spot | `/spot/:id` | Condiciones, gráficas, botón captura |
| Añadir Captura | `/add-catch/:spotId` | Formulario + foto |
| Historial | `/catches` | Lista de todas las capturas |
| Ajustes | `/settings` | Configuración de la app |

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build producción
npm run preview      # Preview del build
npm run lint         # ESLint
npx cap sync         # Sincronizar con native projects
npx cap open android # Abrir Android Studio
npx cap open ios     # Abrir Xcode
```

## 🌐 APIs Utilizadas

### ✅ Open-Meteo Weather API (DATOS REALES)
- **URL**: https://api.open-meteo.com/v1/forecast
- **Datos**: Temperatura, viento, humedad, presión, nubes
- **Estado**: ✅ **INTEGRADO Y FUNCIONANDO**
- **Licencia**: CC BY 4.0
- **Rate limit**: Uso razonable (sin límite estricto)

### ✅ Open-Meteo Marine API (DATOS REALES)
- **URL**: https://marine-api.open-meteo.com/v1/marine
- **Datos**: Altura de olas, periodo, dirección
- **Estado**: ✅ **INTEGRADO Y FUNCIONANDO**
- **Cobertura**: Océanos y mares principales

### 🌊 MeteoSIX API (MeteoGalicia) - IMPLEMENTADA
- **URL**: https://servizos.meteogalicia.gal/apiv5/
- **Cobertura**: Galicia (España) y aguas cercanas
- **Modelos**: WRF (tiempo), WW3/SWAN (oleaje), ROMS/MOHID (corrientes)
- **Estado**: ✅ **CÓDIGO COMPLETO - Requiere API key GRATUITA**
- **Registro**: https://www.meteogalicia.gal/web/apiv5/solicitude-de-uso-da-api
- **Datos de alta resolución** para Galicia:
  - Predicción meteorológica (temperatura, viento, precipitación)
  - Estado del mar (oleaje, temperatura del agua, corrientes)
  - **Mareas** específicas para la costa gallega
- **Ventaja**: Resolución muy superior a APIs globales en la región de Galicia
- **Configuración**: Variable `VITE_METEOSIX_API_KEY` en archivo `.env`

### 🌊 APIs de Mareas (4 Opciones Implementadas)

#### 🌍 WorldTides API - IMPLEMENTADA
- **Estado**: ✅ **CÓDIGO COMPLETO - Requiere configuración**
- **Cobertura**: Global (todos los océanos)
- **Costo**: ~$10/mes (1000 requests)
- **Setup**: Ver [TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md)

#### 🇺🇸 NOAA CO-OPS API - IMPLEMENTADA  
- **Estado**: ✅ **CÓDIGO COMPLETO - Lista para usar**
- **Cobertura**: Estados Unidos (estaciones costeras)
- **Costo**: GRATIS
- **Setup**: Funciona automáticamente en USA

#### �🇸 Puertos del Estado - IMPLEMENTADA
- **Estado**: ⚠️ **CÓDIGO COMPLETO - Pendiente API access**
- **Cobertura**: Puertos españoles
- **Costo**: GRATIS (requiere solicitud de acceso)
- **Contacto**: oceanografia@puertos.es

#### 📝 Guías de Configuración
- **Guía rápida**: [TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md)
- **Detalles técnicos**: [src/api/REAL_TIDE_APIS.md](./src/api/REAL_TIDE_APIS.md)
- **Estado actual**: [API_STATUS.md](./API_STATUS.md)

## 📝 Modelo de Datos

### Spot (Marcador)
```typescript
{
  id: number,
  name: string,
  description: string,
  location: { lat: number, lng: number },
  type: 'fishing' | 'anchoring' | 'sailing' | 'observation' | 'other',
  createdAt: Date,
  updatedAt: Date
}
```

### Catch (Captura)
```typescript
{
  id: number,
  spotId: number,
  date: Date,
  species: string,
  weight?: number,
  photoUrl?: string,
  weather: WeatherConditions,
  notes?: string
}
```

## 🔮 Roadmap

### v0.2.0 (Próxima versión)
- [ ] Filtros avanzados en historial de capturas
- [ ] Estadísticas: capturas por spot, por clima
- [ ] Caché de datos API para offline
- [ ] Exportar capturas a CSV/JSON

### v0.3.0
- [ ] Predicción de mareas (integración nueva API)
- [ ] Notificaciones push (condiciones óptimas)
- [ ] Modo oscuro completo
- [ ] Internacionalización (ES/EN)

### v1.0.0
- [ ] Backend opcional (sincronización multi-dispositivo)
- [ ] Autenticación de usuarios
- [ ] Compartir spots entre usuarios
- [ ] Tests automatizados (unit + e2e)

## 🐛 Problemas Conocidos

- **Mareas**: Por defecto usa datos SIMULADOS. Para usar datos REALES ver:
  - [TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md) - WorldTides/NOAA/Puertos
  - [METEOSIX_SETUP.md](./METEOSIX_SETUP.md) - MeteoSIX para Galicia
- **MeteoSIX**: Solo disponible para Galicia y aguas cercanas. Fuera de esta zona se usa Open-Meteo automáticamente
- **Offline**: Sin caché de APIs (próxima versión)
- **Performance**: Gráficas pueden ser lentas con >500 puntos
- **iOS**: No testeado en dispositivo real (solo simulador)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo
- TypeScript strict mode
- ESLint configurado (ejecutar `npm run lint`)
- Conventional Commits
- Comentarios en código complejo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Xirin Development Team**
- GitHub: [@Chauron](https://github.com/Chauron)

## 🙏 Agradecimientos

- [Open-Meteo](https://open-meteo.com/) por sus APIs gratuitas
- [OpenStreetMap](https://www.openstreetmap.org/) por los mapas
- Comunidad de React y TypeScript

---

**Nota**: Esta es una versión MVP. Muchas funcionalidades están en desarrollo activo. Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles técnicos completos y roadmap detallado.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Chauron/xirin/issues)
- **Documentación**: Ver carpeta `/docs` y `ARCHITECTURE.md`

---

Hecho con ❤️ para la comunidad de pescadores y navegantes 🎣⚓
