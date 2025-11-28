/**
 * XIRIN MARINE - MeteoSIX API Proxy Server
 * 
 * This proxy server forwards requests to MeteoSIX API to bypass CORS restrictions.
 * 
 * Why needed:
 * - MeteoSIX API doesn't include CORS headers
 * - Browser blocks direct requests from localhost
 * - Proxy adds necessary CORS headers
 * 
 * Usage:
 * 1. Run: node vite-proxy-server.js
 * 2. Proxy listens on: http://localhost:3001
 * 3. Frontend sends requests to proxy instead of direct API
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;
const METEOSIX_BASE_URL = 'https://servizos.meteogalicia.gal/apiv5';

// Enable CORS for all origins (development only)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MeteoSIX Proxy Server running',
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for MeteoSIX API
app.get('/api/meteosix/*', async (req, res) => {
  try {
    // Extract the endpoint path (everything after /api/meteosix/)
    const endpoint = req.params[0];
    
    // Build the full MeteoSIX API URL
    const meteoSixUrl = `${METEOSIX_BASE_URL}/${endpoint}`;
    
    // Forward all query parameters
    const queryParams = req.query;
    
    console.log(`🌊 Proxying request to: ${meteoSixUrl}`);
    console.log(`📋 Query params:`, queryParams);
    
    // Make request to MeteoSIX API
    const response = await axios.get(meteoSixUrl, {
      params: queryParams,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Xirin-Marine-App/1.0'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log(`✅ MeteoSIX responded with status: ${response.status}`);
    
    // Forward the response to the client
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ MeteoSIX proxy error:', error.message);
    
    if (error.response) {
      // MeteoSIX API returned an error
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
      res.status(error.response.status).json({
        error: 'MeteoSIX API error',
        message: error.response.data?.message || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(503).json({
        error: 'Service unavailable',
        message: 'MeteoSIX API did not respond',
        details: error.message
      });
    } else {
      // Something else went wrong
      res.status(500).json({
        error: 'Proxy error',
        message: error.message
      });
    }
  }
});

// Start the proxy server
app.listen(PORT, () => {
  console.log('');
  console.log('🌊 ═══════════════════════════════════════════════════════');
  console.log('   XIRIN MARINE - MeteoSIX API Proxy Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Proxy server running on: http://localhost:${PORT}`);
  console.log(`📡 Forwarding to: ${METEOSIX_BASE_URL}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API proxy:    http://localhost:${PORT}/api/meteosix/*`);
  console.log('');
  console.log('🔥 Ready to proxy MeteoSIX API requests!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});
