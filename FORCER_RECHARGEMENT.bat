@echo off
echo ============================================
echo FORCER RECHARGEMENT COMPLET
echo ============================================
echo.

echo [1/6] Arret processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo [2/6] Suppression .next...
cd frontend
if exist .next (
    echo Suppression en cours...
    rd /s /q .next 2>nul
    timeout /t 2 /nobreak >nul
)

echo [3/6] Verification suppression...
if exist .next (
    echo ERREUR: .next existe encore. Fermer VSCode et reessayer.
    pause
    exit /b 1
)
echo OK: .next supprime

echo [4/6] Nettoyage cache Turbopack...
if exist node_modules\.cache rd /s /q node_modules\.cache 2>nul

echo [5/6] Build production pour forcer recompilation...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR BUILD!
    pause
    exit /b 1
)

echo [6/6] Demarrage serveur dev...
echo.
echo ============================================
echo IMPORTANT: La page va s'ouvrir
echo Faites Ctrl+Shift+R pour forcer actualisation
echo ============================================
echo.
start http://localhost:3000
call npm run dev

pause
