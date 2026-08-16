@echo off
chcp 65001 >nul
echo ========================================
echo NETTOYAGE COMPLET DU CACHE
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/5] Suppression du dossier .next...
if exist .next (
    rd /s /q .next
    echo √ Dossier .next supprime
) else (
    echo ! Dossier .next introuvable
)
echo.

echo [2/5] Suppression du cache node_modules...
if exist node_modules\.cache (
    rd /s /q node_modules\.cache
    echo √ Cache node_modules supprime
) else (
    echo ! Cache node_modules introuvable
)
echo.

echo [3/5] Suppression du cache turbo...
if exist .turbo (
    rd /s /q .turbo
    echo √ Cache turbo supprime
) else (
    echo ! Cache turbo introuvable
)
echo.

echo [4/5] Reconstruction complete de l'application...
call npm run build
if errorlevel 1 (
    echo ! Erreur lors du build
    pause
    exit /b 1
)
echo.

echo [5/5] Demarrage du serveur de developpement...
echo.
echo ========================================
echo ! INSTRUCTIONS IMPORTANTES
echo ========================================
echo 1. Ouvrez votre navigateur
echo 2. Appuyez sur F12 (DevTools)
echo 3. Clic droit sur Actualiser
echo 4. Selectionnez "Vider le cache et actualiser de force"
echo 5. Deconnectez-vous et reconnectez-vous
echo ========================================
echo.
echo Appuyez sur une touche pour demarrer le serveur...
pause >nul

call npm run dev
