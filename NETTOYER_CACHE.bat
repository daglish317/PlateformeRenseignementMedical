@echo off
echo ====================================
echo Nettoyage complet des caches
echo ====================================
echo.

echo [1/5] Arret des processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Suppression cache Python...
cd backend
for /d /r %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
cd ..

echo [3/5] Suppression cache Next.js...
cd frontend
if exist .next rd /s /q .next
if exist node_modules\.cache rd /s /q node_modules\.cache

echo [4/5] Suppression cache navigateur (localStorage)...
echo IMPORTANT: Vous devez vider le cache du navigateur manuellement:
echo - Chrome: Ctrl+Shift+Delete
echo - Firefox: Ctrl+Shift+Delete
echo - Edge: Ctrl+Shift+Delete
echo Cochez "Cookies et donnees de sites" + "Images et fichiers en cache"

echo [5/5] Nettoyage termine!
echo.
echo ====================================
echo ETAPES SUIVANTES:
echo ====================================
echo 1. Demarrer backend:
echo    cd backend
echo    py manage.py runserver
echo.
echo 2. Demarrer frontend (nouveau terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Vider cache navigateur (Ctrl+Shift+Delete)
echo.
echo 4. Ouvrir http://localhost:3000
echo.
echo 5. Se deconnecter/reconnecter
echo ====================================
pause
