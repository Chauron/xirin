// API Status Logger - Shows which APIs are configured
export function logAPIStatus() {
  const worldTidesKey = import.meta.env.VITE_WORLDTIDES_API_KEY;
  const puertosKey = import.meta.env.VITE_PUERTOS_API_KEY;
  const meteoSixKey = import.meta.env.VITE_METEOSIX_API_KEY;
  
  console.log('\n🌊 ═══════════════════════════════════════════════════════');
  console.log('   XIRIN MARINE - API Status');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Weather APIs (always available)
  console.log('☁️  Weather & Marine Data:');
  console.log('   ✅ Open-Meteo Weather API - ACTIVE (Real Data - Global)');
  console.log('   ✅ Open-Meteo Marine API - ACTIVE (Real Data - Global)');
  
  if (meteoSixKey && meteoSixKey !== 'your_meteosix_api_key_here') {
    console.log('   ✅ MeteoSIX API - CONFIGURED (Real Data - Galicia)');
    console.log('      High resolution (1km) for Galicia region');
  } else {
    console.log('   ⚠️  MeteoSIX API - NOT CONFIGURED (Galicia only)');
    console.log('      Get key at: https://www.meteogalicia.gal/web/apiv5/');
  }
  console.log('');
  
  // Tide APIs (check configuration)
  console.log('🌊 Tide Data Providers:');
  
  if (worldTidesKey && worldTidesKey !== 'your_worldtides_api_key_here') {
    console.log('   ✅ WorldTides API - CONFIGURED (Real Data - Global)');
  } else {
    console.log('   ⚠️  WorldTides API - NOT CONFIGURED (Will use simulated)');
    console.log('      Get key at: https://www.worldtides.info/register');
  }
  
  console.log('   ✅ NOAA CO-OPS API - AVAILABLE (Real Data - USA only)');
  
  if (meteoSixKey && meteoSixKey !== 'your_meteosix_api_key_here') {
    console.log('   ✅ MeteoSIX Tides - CONFIGURED (Real Data - Galicia)');
    console.log('      15 Galician ports with tide predictions');
  } else {
    console.log('   ⚠️  MeteoSIX Tides - NOT CONFIGURED (Galicia only)');
  }
  
  if (puertosKey && puertosKey !== 'your_puertos_api_key_here') {
    console.log('   ⚠️  Puertos del Estado - CONFIGURED but not implemented yet');
  } else {
    console.log('   ⚠️  Puertos del Estado - NOT CONFIGURED (Spain only)');
    console.log('      Contact: oceanografia@puertos.es');
  }
  
  console.log('   ℹ️  Simulated Tide Data - AVAILABLE (Fallback)\n');
  
  console.log('📖 Configuration:');
  console.log('   • Change provider in: Settings > Tide Provider');
  console.log('   • Setup guides:');
  console.log('     - TIDE_SETUP_GUIDE.md (WorldTides, NOAA, Puertos)');
  console.log('     - METEOSIX_SETUP.md (MeteoSIX for Galicia)');
  console.log('   • API details: src/api/REAL_TIDE_APIS.md\n');
  
  console.log('═══════════════════════════════════════════════════════\n');
}
