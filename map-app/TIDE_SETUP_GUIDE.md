# 🌊 Guía de Configuración de APIs de Mareas

## ✅ Estado Actual

Las **3 APIs de mareas** están implementadas y listas para usar:
- 🌍 **WorldTides** (cobertura global)
- 🇺🇸 **NOAA** (USA)
- 🇪🇸 **Puertos del Estado** (España)

## 🚀 Configuración Rápida

### Opción 1: WorldTides (Recomendado - Global) 🌍

**Paso 1**: Obtén tu API key
- Ve a https://www.worldtides.info/register
- Crea una cuenta (~$10/mes para 1000 requests)
- Copia tu API key

**Paso 2**: Configura la variable de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y añade tu API key
VITE_WORLDTIDES_API_KEY=tu_api_key_real_aqui
```

**Paso 3**: Selecciona el proveedor en la app
- Abre la aplicación
- Ve a **⚙️ Ajustes**
- En "Proveedor de mareas" selecciona **"OpenTidePrediction (WorldTides)"**
- ¡Listo! Ahora usa datos reales

**Verificación**:
```
Al crear una captura, verás en consola:
"🌊 Fetching tide data with provider: opentide"
"🌍 Fetching REAL tide data from WorldTides API..."
"✅ Retrieved 4 REAL tide events from WorldTides"
```

---

### Opción 2: NOAA (Gratis - Solo USA) 🇺🇸

**Paso 1**: No necesitas API key (gratis)

**Paso 2**: Verifica que estés en USA
- NOAA solo funciona en localizaciones dentro de USA
- La app busca automáticamente la estación más cercana

**Paso 3**: Selecciona el proveedor
- Ve a **⚙️ Ajustes**
- Selecciona **"NOAA CO-OPS"**

**Estaciones disponibles**:
- San Francisco
- New York (The Battery)
- Providence
- Galveston
- San Diego
- Lewes
- Virginia (Sewells Point)
- Florida (Virginia Key)

**Verificación**:
```
Al crear una captura, verás en consola:
"🌊 Fetching tide data with provider: noaa"
"🇺🇸 Fetching REAL tide data from NOAA CO-OPS API..."
"Using NOAA station: San Francisco (5.2km away)"
"✅ Retrieved 4 REAL tide events from NOAA"
```

**Si estás fuera de USA**:
```
⚠️ Nearest NOAA station (San Francisco) is 8524km away
NOAA API only covers US locations. Falling back to simulated data...
```

---

### Opción 3: Puertos del Estado (Gratis - Solo España) 🇪🇸

**Estado**: API disponible pero requiere acceso

**Paso 1**: Solicita acceso
- Contacta: oceanografia@puertos.es
- Solicita acceso a la API de Portus (mareas y oleaje)
- Es gratuito pero requiere aprobación

**Paso 2**: Una vez aprobado, configura
```bash
# En tu archivo .env
VITE_PUERTOS_API_KEY=tu_clave_de_acceso
```

**Paso 3**: Selecciona el proveedor
- Ve a **⚙️ Ajustes**
- Selecciona **"Puertos del Estado (España)"**

**Puertos disponibles**:
- A Coruña
- Bilbao
- Santander
- Gijón
- Barcelona
- Valencia
- Málaga
- Cádiz
- Huelva
- Vigo

**Nota**: La implementación técnica específica dependerá de la documentación que proporcionen al aprobar tu acceso.

---

## 🔄 Fallback Automático

Si la API falla por cualquier razón, la app automáticamente:
1. Muestra un warning en consola
2. Usa datos simulados (calculados astronómicamente)
3. Continúa funcionando sin errores

**Ejemplo de fallback**:
```
Error fetching WorldTides data: API key invalid
⚠️ Falling back to simulated data...
⚠️ Using SIMULATED tide data (fallback)
```

---

## 📊 Comparación de Proveedores

| Proveedor | Cobertura | Costo | Setup | Precisión |
|-----------|-----------|-------|-------|-----------|
| **WorldTides** | 🌍 Global | $10/mes | Fácil | ⭐⭐⭐⭐⭐ |
| **NOAA** | 🇺🇸 Solo USA | Gratis | Muy fácil | ⭐⭐⭐⭐⭐ |
| **Puertos** | 🇪🇸 Solo España | Gratis | Medio | ⭐⭐⭐⭐⭐ |
| **Simulado** | 🌍 Global | Gratis | Ninguno | ⭐⭐ Demo |

---

## 🧪 Cómo Probar

1. **Configura tu proveedor** (según arriba)

2. **Reinicia la app**:
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

3. **Abre la consola del navegador** (F12)

4. **Crea una nueva captura**:
   - Ve al mapa
   - Click en un spot
   - "Añadir Captura"
   - Rellena los campos
   - Guarda

5. **Revisa la consola**:
   - Busca los mensajes de 🌊
   - Verifica que diga "REAL tide data"
   - Comprueba que no dice "SIMULATED" o "fallback"

6. **Mira los detalles de la captura**:
   - Ve a "Capturas"
   - Click en tu captura reciente
   - Busca el gráfico de marea
   - Debería mostrar la curva con datos reales

---

## 🐛 Solución de Problemas

### "API key not configured"
**Problema**: No has configurado la API key en `.env`

**Solución**:
```bash
# 1. Verifica que existe el archivo .env
ls .env

# 2. Si no existe, créalo desde el ejemplo
cp .env.example .env

# 3. Edita .env y añade tu key
code .env

# 4. Reinicia el servidor
```

### "Falling back to simulated data"
**Posibles causas**:
1. **API key inválida**: Verifica que la copiaste correctamente
2. **Sin internet**: Comprueba tu conexión
3. **Fuera de cobertura**: NOAA/Puertos solo cubren sus regiones
4. **Límite de requests**: Has excedido tu cuota (WorldTides)

**Solución**:
- Revisa los mensajes de error específicos en consola
- Prueba con otro proveedor
- Verifica tu API key en el panel del proveedor

### "Nearest station is XXXkm away"
**Problema**: Estás demasiado lejos de las estaciones disponibles

**Solución**:
- **Para NOAA**: Usa solo en USA
- **Para Puertos**: Usa solo en España
- **Para otros lugares**: Usa WorldTides (global)

---

## 💡 Recomendaciones

### Para Testing/Demo:
✅ **Usa simulado** (ya está configurado)
- No requiere API key
- Funciona en cualquier lugar
- Suficiente para probar la UI

### Para Producción (Tu ubicación):
- 🇪🇸 **España**: Puertos del Estado (gratis) o WorldTides
- 🇺🇸 **USA**: NOAA (gratis)
- 🌍 **Otros países**: WorldTides

### Para App Comercial:
✅ **WorldTides** - Vale los $10/mes porque:
- Funciona en todo el mundo
- Tus usuarios pueden estar en cualquier lugar
- No necesitas gestionar múltiples APIs
- Soporte técnico incluido

---

## 📝 Variables de Entorno Completas

Tu archivo `.env` debería tener:

```env
# WorldTides API (Global)
VITE_WORLDTIDES_API_KEY=wt_abc123def456...

# NOAA (USA - No key needed, but app name recommended)
VITE_NOAA_APP_NAME=XirinMarine

# Puertos del Estado (España)
VITE_PUERTOS_API_KEY=pendiente_de_aprobacion
```

**Importante**: 
- ⚠️ NO subas el archivo `.env` a GitHub
- El archivo `.gitignore` ya está configurado para ignorarlo
- Comparte solo `.env.example` (sin keys reales)

---

## ✅ Checklist de Configuración

- [ ] Decidí qué proveedor usar
- [ ] Obtuve mi API key (si es necesario)
- [ ] Copié `.env.example` a `.env`
- [ ] Añadí mi API key al archivo `.env`
- [ ] Reinicié el servidor dev
- [ ] Seleccioné el proveedor en Ajustes
- [ ] Probé crear una captura
- [ ] Verifiqué en consola que dice "REAL tide data"
- [ ] Confirmé que el gráfico de marea se muestra

---

¡Ya estás listo para usar datos de mareas reales! 🎣🌊

**¿Necesitas ayuda?** 
- Revisa los logs en consola (F12)
- Lee `src/api/REAL_TIDE_APIS.md` para detalles técnicos
- Verifica `API_STATUS.md` para el estado general
