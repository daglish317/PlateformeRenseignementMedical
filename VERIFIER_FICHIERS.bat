@echo off
chcp 65001 >nul
echo ========================================
echo VERIFICATION DES FICHIERS SOURCES
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Verification owner-navigation.ts...
powershell -Command "Get-Content 'frontend\src\features\shared\dashboard\navigation\owner-navigation.ts' | Measure-Object -Line | Select-Object -ExpandProperty Lines"
echo lignes trouvees
echo.

echo [2] Recherche des modules dans owner-navigation.ts...
powershell -Command "Select-String -Path 'frontend\src\features\shared\dashboard\navigation\owner-navigation.ts' -Pattern 'label:' | Measure-Object | Select-Object -ExpandProperty Count"
echo modules trouves (items avec label)
echo.

echo [3] Modules PHARMACIE:
powershell -Command "Select-String -Path 'frontend\src\features\shared\dashboard\navigation\owner-navigation.ts' -Pattern 'structureType: \"PHARMACIE\"' -AllMatches | Measure-Object | Select-Object -ExpandProperty Count"
echo modules PHARMACIE
echo.

echo [4] Modules HOPITAL:
powershell -Command "Select-String -Path 'frontend\src\features\shared\dashboard\navigation\owner-navigation.ts' -Pattern 'structureType: \"HOPITAL\"' -AllMatches | Measure-Object | Select-Object -ExpandProperty Count"
echo modules HOPITAL
echo.

echo [5] Verification filtrage dans useDashboardNavigation.ts...
powershell -Command "Select-String -Path 'frontend\src\features\shared\dashboard\hooks\useDashboardNavigation.ts' -Pattern 'structureType' -AllMatches | Measure-Object | Select-Object -ExpandProperty Count"
echo references a structureType trouvees
echo.

echo [6] Verification staleTime dans useMyStructure.ts...
powershell -Command "Select-String -Path 'frontend\src\features\shared\structure-profile\hooks\useMyStructure.ts' -Pattern 'staleTime'"
echo.

echo ========================================
echo VERIFICATION TERMINEE
echo ========================================
echo.
echo Si tous les chiffres sont corrects mais l'interface
echo ne change pas, c'est un probleme de cache.
echo.
echo Executez: NETTOYER_CACHE_COMPLET.bat
echo.
pause
