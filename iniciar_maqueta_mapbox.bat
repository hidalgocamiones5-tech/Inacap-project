@echo off
echo Iniciando Maqueta SIT-Nuble (Mapbox v3)...

IF NOT EXIST "node_modules\" (
    echo Instalando dependencias necesarias (mapbox-gl, react-map-gl, etc)...
    npm install mapbox-gl react-map-gl lucide-react tailwindcss
) ELSE (
    echo Dependencias ya instaladas. Verificando mapbox-gl...
    npm install mapbox-gl react-map-gl
)

echo Levantando servidor local con Vite...
npm run dev
pause
