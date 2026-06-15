@echo off
title SIT-Nuble - Entorno Virtual y Frontend
echo ===================================================
echo     Iniciando Entorno Virtual (.venv)
echo ===================================================
cd /d "%~dp0"

REM Activar entorno virtual
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo [OK] Entorno virtual activado.
) else (
    echo [WARNING] No se encontro el entorno virtual en .venv.
)

REM Instalar dependencias si no existen
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias de Node...
    call npm install --legacy-peer-deps
)

echo [INFO] Levantando el Frontend...
call npm start
pause
