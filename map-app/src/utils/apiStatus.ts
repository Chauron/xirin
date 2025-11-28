// API Status Logger - Shows which APIs are configured
export function logAPIStatus() {
  const worldTidesKey = import.meta.env.VITE_WORLDTIDES_API_KEY;
  const puertosKey = import.meta.env.VITE_PUERTOS_API_KEY;
  
  console.log('\n🌊 ═══════════════════════════════════════════════════════');
  console.log('   XIRIN MARINE - API Status');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Weather APIs (always available)
  console.log('☁️  Weather & Marine Data:');
  console.log('   ✅ Open-Meteo Weather API - ACTIVE (Real Data)');
  console.log('   ✅ Open-Meteo Marine API - ACTIVE (Real Data)\n');
  
  // Tide APIs (check configuration)
  console.log('🌊 Tide Data Providers:');
  
  if (worldTidesKey && worldTidesKey !== 'your_worldtides_api_key_here') {
    console.log('   ✅ WorldTides API - CONFIGURED (Real Data)');
  } else {
    console.log('   ⚠️  WorldTides API - NOT CONFIGURED (Will use simulated)');
    console.log('      Get key at: https://www.worldtides.info/register');
  }
  
  console.log('   ✅ NOAA CO-OPS API - AVAILABLE (Real Data - USA only)');
  
  if (puertosKey && puertosKey !== 'your_puertos_api_key_here') {
    console.log('   ⚠️  Puertos del Estado - CONFIGURED but not implemented yet');
  } else {
    console.log('   ⚠️  Puertos del Estado - NOT CONFIGURED (Spain only)');
    console.log('      Contact: oceanografia@puertos.es');
  }
  
  console.log('   ℹ️  Simulated Tide Data - AVAILABLE (Fallback)\n');
  
  console.log('📖 Configuration:');
  console.log('   • Change provider in: Settings > Tide Provider');
  console.log('   • Setup guide: TIDE_SETUP_GUIDE.md');
  console.log('   • API details: src/api/REAL_TIDE_APIS.md\n');
  
  console.log('═══════════════════════════════════════════════════════\n');
}
