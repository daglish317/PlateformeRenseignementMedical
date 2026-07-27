@echo off
REM Script de test de l'API - Structure Submit Endpoint
REM Usage: test-api.bat [TOKEN]

echo ==========================================
echo Test de l'API - Soumission Structure
echo ==========================================
echo.

SET API_URL=http://localhost:8000/api
SET ENDPOINT=%API_URL%/structures/submit/

if "%~1"=="" (
    echo Usage: test-api.bat [YOUR_JWT_TOKEN]
    echo.
    echo Pour obtenir un token:
    echo 1. Connectez-vous sur le frontend
    echo 2. Ouvrez la console ^(F12^)
    echo 3. Tapez: localStorage.getItem^('access_token'^)
    echo 4. Copiez le token et relancez: test-api.bat ^<token^>
    echo.
    echo Ou testez le login directement:
    echo.
    echo curl -X POST %API_URL%/utilisateurs/login/ -H "Content-Type: application/json" -d "{\"email\":\"gestionnaire@test.com\",\"password\":\"Gestionnaire123!\"}"
    echo.
    exit /b 1
)

SET TOKEN=%~1

echo Token fourni: %TOKEN:~0,20%...
echo Endpoint: %ENDPOINT%
echo.

echo Envoi de la requête...
echo.

curl -X POST "%ENDPOINT%" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: multipart/form-data" ^
  -F "nom=Hopital Test" ^
  -F "type=HOPITAL" ^
  -F "adresse=123 Rue de Test, Yaounde" ^
  -F "telephone=0123456789" ^
  -F "latitude=3.8480" ^
  -F "longitude=11.5021" ^
  -v

echo.
echo.
echo ==========================================
echo Test termine
echo ==========================================
