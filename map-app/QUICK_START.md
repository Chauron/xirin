# 🚀 INICIO RÁPIDO - APIs de Mareas

## 📊 Estado Actual

```
╔══════════════════════════════════════════════════════════╗
║                   XIRIN MARINE                           ║
║              API Integration Status                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  METEOROLOGÍA:                                           ║
║  ✅ Open-Meteo Weather .......... REAL DATA - ACTIVO    ║
║  ✅ Open-Meteo Marine ........... REAL DATA - ACTIVO    ║
║                                                          ║
║  MAREAS (3 opciones):                                    ║
║  🌍 WorldTides (Global) ......... IMPLEMENTADO          ║
║  🇺🇸 NOAA (USA) ................. IMPLEMENTADO          ║
║  🇪🇸 Puertos (España) ........... IMPLEMENTADO          ║
║                                                          ║
║  Por defecto: Datos simulados (para testing)            ║
╚══════════════════════════════════════════════════════════╝
```

---

## ⚡ Configuración en 3 Pasos

### Si estás en USA 🇺🇸 (GRATIS)
```bash
1. npm run dev
2. Abre http://localhost:5173
3. Ve a Ajustes > Selecciona "NOAA CO-OPS"
✅ ¡Listo! Ya tienes datos reales
```

### Si estás en cualquier parte 🌍 ($10/mes)
```bash
1. Regístrate en https://www.worldtides.info/register
2. Copia tu API key
3. cp .env.example .env
4. Edita .env:
   VITE_WORLDTIDES_API_KEY=tu_api_key_aqui
5. npm run dev
6. Ajustes > Selecciona "OpenTidePrediction"
✅ ¡Listo! Datos reales globales
```

### Si estás en España 🇪🇸 (GRATIS, requiere aprobación)
```bash
1. Email a: oceanografia@puertos.es
2. Solicita acceso a API Portus
3. Espera aprobación (1-5 días)
4. Configura API key cuando la recibas
5. Ajustes > Selecciona "Puertos del Estado"
```

---

## 📖 Documentación

| Archivo | Para quién | Qué contiene |
|---------|-----------|--------------|
| **[TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md)** | 👥 Usuarios | Guía paso a paso, troubleshooting |
| **[REAL_TIDE_APIS.md](./src/api/REAL_TIDE_APIS.md)** | 👨‍💻 Desarrolladores | Código, endpoints, ejemplos |
| **[API_STATUS.md](./API_STATUS.md)** | 📊 Todos | Estado general, comparativas |
| **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** | 🎉 Resumen | Checklist, próximos pasos |

---

## 🧪 Cómo Verificar que Funciona

### 1. Inicia la app:
```bash
npm run dev
```

### 2. Mira la consola del navegador (F12):
Deberías ver:
```
🌊 ═══════════════════════════════════════════════════════
   XIRIN MARINE - API Status
═══════════════════════════════════════════════════════

☁️  Weather & Marine Data:
   ✅ Open-Meteo Weather API - ACTIVE (Real Data)
   ✅ Open-Meteo Marine API - ACTIVE (Real Data)

🌊 Tide Data Providers:
   [Estado según tu configuración]
```

### 3. Crea una captura:
- Click en un spot del mapa
- "Añadir Captura"
- Rellena y guarda

### 4. Verifica en consola:
```
🌊 === FETCHING CATCH DATA ===
☁️ Fetching REAL weather from Open-Meteo API...
✅ Retrieved 24 hours of REAL weather data
🌊 Fetching tide data with provider: [tu_proveedor]
🌍 Fetching REAL tide data from WorldTides API...
✅ Retrieved 4 REAL tide events from WorldTides
```

### 5. Mira la captura:
- Ve a "Capturas"
- Abre tu captura
- Busca el gráfico de curva de marea
- ✅ Debería mostrar datos

---

## 🎯 Elección Rápida de Proveedor

```
┌─────────────────────────────────────────────────────┐
│ ¿Dónde estás pescando?                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🇺🇸 USA                                            │
│  → NOAA CO-OPS (GRATIS, ya funciona)              │
│                                                     │
│  🇪🇸 España                                         │
│  → Puertos del Estado (GRATIS, solicitar acceso)  │
│     o WorldTides ($10/mes, inmediato)             │
│                                                     │
│  🌍 Otros países                                    │
│  → WorldTides ($10/mes, cobertura global)         │
│                                                     │
│  🧪 Solo testing/demo                              │
│  → Simulado (ya activo, sin configurar nada)     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔥 Comandos Útiles

```bash
# Ver qué APIs están configuradas
cat .env

# Copiar template de configuración
cp .env.example .env

# Editar configuración
code .env    # o tu editor favorito

# Reiniciar servidor (necesario después de cambiar .env)
# Ctrl+C para parar, luego:
npm run dev

# Ver logs en tiempo real
# F12 en el navegador > Pestaña Console
```

---

## ⚠️ Troubleshooting Rápido

### "API key not configured"
```bash
# Verifica que existe .env
ls .env

# Si no existe
cp .env.example .env

# Edítalo y añade tu key
code .env

# IMPORTANTE: Reinicia el servidor
```

### "Falling back to simulated data"
**Causas posibles**:
- ❌ API key incorrecta → Revisa que la copiaste bien
- ❌ No reiniciaste servidor → Ctrl+C y `npm run dev`
- ❌ Estás fuera de cobertura → USA/España requieren APIs específicas
- ❌ Límite excedido → Revisa tu cuota en el proveedor

### No veo el gráfico de marea
**Soluciones**:
1. Crea una nueva captura (las viejas tienen pocos datos)
2. Verifica proveedor en Ajustes
3. Revisa consola (F12) para ver errores
4. Lee TIDE_SETUP_GUIDE.md paso a paso

---

## 💡 Tips Pro

### 🎓 Para desarrollo:
- Deja el proveedor en "Ninguno" o simulado
- No gastes requests de APIs de pago
- Activa el proveedor real solo para testing final

### 💰 Para producción (ahorro):
- Si tu app es solo USA → NOAA (gratis)
- Si tu app es solo España → Puertos (gratis después de aprobación)
- Si tu app es global → WorldTides (vale los $10/mes)

### 🚀 Para lanzamiento:
- Backend proxy para cachear requests (reduce costos)
- Implementa rate limiting
- Monitorea uso de API
- Ten fallback a simulado siempre activo

---

## 📞 ¿Necesitas Ayuda?

1. **Lee primero**: [TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md)
2. **Revisa consola**: F12 > Console (muestra errores específicos)
3. **Verifica .env**: ¿Existe? ¿Tiene la key correcta?
4. **Reiniciaste**: ¿Paraste y arrancaste el servidor después de editar .env?
5. **Proveedor**: ¿Seleccionaste el correcto en Ajustes?

---

## ✅ Checklist Antes de Producción

- [ ] Decidí qué proveedor usar
- [ ] Obtuve API key (si necesaria)
- [ ] Configuré `.env`
- [ ] `.env` está en `.gitignore` ✓ (ya lo está)
- [ ] Probé crear captura
- [ ] Verifiqué logs dicen "REAL tide data"
- [ ] Gráfico de marea se muestra correctamente
- [ ] Tengo plan B (fallback funciona)
- [ ] Documenté qué proveedor uso en mi README

---

# 🎉 ¡Ya Está Todo Listo!

```
    🌊 XIRIN MARINE 🌊
    
    ✅ Meteorología: REAL
    ✅ Datos marinos: REAL
    ✅ Mareas: 3 APIs disponibles
    
    📚 Documentación: Completa
    🔧 Código: Implementado
    🧪 Testing: Listo para probar
    
    🚀 Next: Configura tu proveedor
```

**Start here**: [TIDE_SETUP_GUIDE.md](./TIDE_SETUP_GUIDE.md) 📖
