# Script para construir e instalar la app en dispositivo Android
# Uso: .\install-app.ps1

Write-Host "🔨 Construyendo la aplicación React..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Sincronizando con Capacitor..." -ForegroundColor Cyan
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al sincronizar con Capacitor" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Construyendo APK..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir APK" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "📱 Instalando en dispositivo..." -ForegroundColor Cyan
adb install -r app\build\outputs\apk\debug\app-debug.apk

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar en dispositivo" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✅ App instalada exitosamente!" -ForegroundColor Green
Write-Host "🚀 Puedes abrir la app 'XIRIN MARINE' en tu dispositivo" -ForegroundColor Yellow
