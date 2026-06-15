@echo off
title SIT-Nuble 3D Fotorrealista - Preparador de Entorno (Resium/Cesium)
echo ===================================================
echo     SIT-Nuble 3D: Iniciando Preparacion de Entorno
echo     Google Photorealistic 3D Tiles + CesiumJS
echo ===================================================
cd /d "%~dp0"

echo [1/3] Verificando entorno virtual y dependencias de node...
if not exist "node_modules\" (
    echo [2/3] La carpeta node_modules no existe. Instalando dependencias base y motores 3D...
    echo Esto puede tomar un momento debido al tamaño de CesiumJS...
    npm install cesium resium vite-plugin-cesium lucide-react tailwindcss @tailwindcss/postcss postcss autoprefixer --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo Error durante la instalacion de paquetes npm.
        pause
        exit /b %errorlevel%
    )
    echo Dependencias instaladas correctamente.
) else (
    echo [2/3] Carpeta node_modules encontrada. Asegurando dependencias de Cesium...
    npm install cesium resium vite-plugin-cesium --legacy-peer-deps
)

echo.
echo [3/3] Iniciando Servidor Frontend de Desarrollo...
echo ===================================================
echo Abre tu navegador en la URL que aparecera a continuacion.
echo (Nota: La primera carga de Cesium puede tomar unos segundos extras)
echo ===================================================
npm run dev

pause
