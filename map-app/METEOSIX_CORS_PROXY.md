# MeteoSIX CORS Proxy Setup

## Problem

MeteoSIX API doesn't include CORS headers, preventing direct browser requests:

```
Access to XMLHttpRequest at 'https://servizos.meteogalicia.gal/apiv5/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution

A local proxy server forwards requests to MeteoSIX API and adds CORS headers.

## Setup

### 1. Install dependencies (already done)

```bash
npm install
```

### 2. Start the proxy server

**Option A: Run proxy and dev server together (RECOMMENDED)**
```bash
npm run dev:all
```

**Option B: Run separately in two terminals**

Terminal 1:
```bash
npm run proxy
```

Terminal 2:
```bash
npm run dev
```

## How it works

```
Browser (localhost:5173)
    ↓
Proxy Server (localhost:3001)
    ↓ [adds CORS headers]
MeteoSIX API (servizos.meteogalicia.gal)
```

### Request Flow

1. **Frontend** makes request to: `http://localhost:3001/api/meteosix/getNumericForecastInfo`
2. **Proxy** forwards to: `https://servizos.meteogalicia.gal/apiv5/getNumericForecastInfo`
3. **Proxy** receives response and adds CORS headers
4. **Frontend** receives data without CORS errors

## Configuration

### Environment Variables (.env)

```bash
# MeteoSIX API key
VITE_METEOSIX_API_KEY=your_api_key_here

# Proxy server URL
VITE_METEOSIX_PROXY_URL=http://localhost:3001/api/meteosix
```

## Verification

### 1. Check proxy is running

Open browser: http://localhost:3001/health

Should see:
```json
{
  "status": "ok",
  "message": "MeteoSIX Proxy Server running",
  "timestamp": "2025-11-28T..."
}
```

### 2. Check console logs

Proxy terminal should show:
```
🌊 ═══════════════════════════════════════════════════════
   XIRIN MARINE - MeteoSIX API Proxy Server
═══════════════════════════════════════════════════════

✅ Proxy server running on: http://localhost:3001
📡 Forwarding to: https://servizos.meteogalicia.gal/apiv5

🔥 Ready to proxy MeteoSIX API requests!
```

### 3. Test from your app

Navigate to a location in Galicia (e.g., A Coruña: 43.36°N, -8.25°W)

Console should show:
```
📍 Location within Galicia - trying MeteoSIX API first
🌦️ Fetching weather data from MeteoSIX API...
✅ Using REAL weather data from MeteoSIX
```

Proxy console should show:
```
🌊 Proxying request to: https://servizos.meteogalicia.gal/apiv5/getNumericForecastInfo
✅ MeteoSIX responded with status: 200
```

## Troubleshooting

### Proxy won't start

**Error**: `Port 3001 already in use`

**Solution**: Kill the process using port 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Still getting CORS errors

**Check**:
1. Is proxy server running? → `http://localhost:3001/health`
2. Is `.env` file created? → Check `VITE_METEOSIX_PROXY_URL`
3. Did you restart Vite? → Restart with proxy: `npm run dev:all`

### Connection refused

**Error**: `ECONNREFUSED localhost:3001`

**Solution**: Start the proxy server:
```bash
npm run proxy
```

### MeteoSIX API returns 401

**Check**: API key is correctly set in `.env`
```bash
VITE_METEOSIX_API_KEY=2w8Jl81z9K6Z4cKW2PI70ZT8pzzGq78r7sb7AcMu2uaBR9TNHB03r0r09o18O55u
```

## Production Deployment

For production, you have two options:

### Option 1: Deploy Proxy Server

Deploy `vite-proxy-server.js` to a cloud service (Heroku, Railway, etc.)

Update `.env.production`:
```bash
VITE_METEOSIX_PROXY_URL=https://your-proxy.herokuapp.com/api/meteosix
```

### Option 2: Use Capacitor Native HTTP

In the mobile app, use Capacitor's native HTTP client which doesn't have CORS restrictions.

Add to `capacitor.config.json`:
```json
{
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  }
}
```

## Architecture

```
Development:
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React App      │─────▶│  Proxy Server    │─────▶│  MeteoSIX API   │
│  localhost:5173 │      │  localhost:3001  │      │  meteogalicia   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
     Browser                    Node.js                  External

Production (Web):
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React App      │─────▶│  Proxy Server    │─────▶│  MeteoSIX API   │
│  your-domain    │      │  proxy.domain    │      │  meteogalicia   │
└─────────────────┘      └──────────────────┘      └─────────────────┘

Production (Mobile):
┌─────────────────┐                                 ┌─────────────────┐
│  Capacitor App  │────────────────────────────────▶│  MeteoSIX API   │
│  Native HTTP    │  (No CORS restrictions)         │  meteogalicia   │
└─────────────────┘                                 └─────────────────┘
```

## Related Files

- `vite-proxy-server.js` - Proxy server implementation
- `src/api/meteoSixApi.ts` - Frontend API client (uses proxy)
- `.env` - Environment configuration
- `package.json` - Scripts: `proxy`, `dev:all`

## Why This Approach?

1. ✅ **Simple**: Single Node.js file
2. ✅ **Fast**: Local proxy, minimal latency
3. ✅ **Secure**: API key stays server-side in production
4. ✅ **Compatible**: Works with all browsers
5. ✅ **Development-friendly**: Easy to debug with console logs
6. ✅ **Production-ready**: Can deploy to any Node.js host

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start both servers: `npm run dev:all`
3. ✅ Test in browser at Galicia location
4. 🚀 Enjoy high-resolution MeteoSIX data!
