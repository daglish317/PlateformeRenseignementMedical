# SOLUTION COMPLÈTE - Problème de Cache Dashboard Propriétaire

## 🔍 DIAGNOSTIC DU PROBLÈME

### Problème Rapporté
- Le propriétaire ne voit que **5 modules** dans la sidebar au lieu de **tous les modules**
- Aucun changement visible malgré les modifications du code source
- Les fichiers sources sont **corrects** (vérifiés via grep PowerShell)

### Cause Racine Identifiée
**Triple cache en cascade:**

1. **React Query Cache**: `useMyStructure()` a un `staleTime: 10 minutes`
   - Le type de structure est mis en cache et non refetch
   - Position: `frontend/src/features/shared/structure-profile/hooks/useMyStructure.ts:19`

2. **Next.js Build Cache**: Dossier `.next/` conserve l'ancienne compilation
   - Les modules JavaScript compilés ne sont pas régénérés
   - Le dev server (`npm run dev`) ne détecte pas toujours les changements

3. **Browser Cache**: Cookies + LocalStorage + Service Workers
   - Les données utilisateur et permissions sont mises en cache côté navigateur

### Fichiers Impactés et Vérifiés ✅
- `frontend/src/features/shared/dashboard/navigation/owner-navigation.ts` - **19 modules** avec `structureType`
- `frontend/src/features/shared/dashboard/hooks/useDashboardNavigation.ts` - Filtrage par `structureType`
- `frontend/src/features/shared/dashboard/types.ts` - Champ `structureType` ajouté
- `frontend/src/features/shared/structure-profile/hooks/useMyStructure.ts` - **CACHE 10 MIN ICI**

---

## 🛠️ SOLUTION ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Réduire le Cache React Query (PERMANENT)

**Modifier le fichier:** `frontend/src/features/shared/structure-profile/hooks/useMyStructure.ts`

**Changer:**
```typescript
staleTime: 10 * 60 * 1000, // 10 minutes - TROP LONG
```

**Par:**
```typescript
staleTime: 30 * 1000, // 30 secondes - Plus réactif
```

**Résultat:** React Query revalidera les données toutes les 30 secondes au lieu de 10 minutes.

---

### ÉTAPE 2: Nettoyer Complètement le Cache Next.js

#### Option A: Commandes Manuelles (Windows CMD)
```cmd
cd c:\Users\Lionnel\Desktop\cours\projet de stage L2\frontend

REM Arrêter le serveur (Ctrl+C si nécessaire)

REM Supprimer le cache Next.js
rd /s /q .next

REM Supprimer node_modules/.cache si existe
rd /s /q node_modules\.cache

REM Rebuild complet
npm run build

REM Redémarrer le dev server
npm run dev
```

#### Option B: Script Automatisé (recommandé)
J'ai créé: `NETTOYER_CACHE_COMPLET.bat`

---

### ÉTAPE 3: Nettoyer le Cache Navigateur

1. **Ouvrir DevTools** (F12)
2. **Clic droit** sur le bouton Actualiser
3. **"Vider le cache et actualiser de force"** (Ctrl+Shift+R)
4. **Aller dans Application > Storage**
5. **Supprimer:**
   - Cookies
   - LocalStorage
   - SessionStorage
   - Cache Storage

---

### ÉTAPE 4: Déconnexion/Reconnexion

1. Se déconnecter de l'application
2. Fermer tous les onglets de l'application
3. Rouvrir un nouvel onglet
4. Se reconnecter

**Pourquoi?** Forcer React Query à refetch toutes les données utilisateur et structure.

---

## 🚀 SCRIPT AUTOMATISÉ CRÉÉ

### `NETTOYER_CACHE_COMPLET.bat`

```batch
@echo off
echo ========================================
echo NETTOYAGE COMPLET DU CACHE
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/5] Suppression du dossier .next...
if exist .next (
    rd /s /q .next
    echo ✓ Dossier .next supprimé
) else (
    echo ⚠ Dossier .next introuvable
)
echo.

echo [2/5] Suppression du cache node_modules...
if exist node_modules\.cache (
    rd /s /q node_modules\.cache
    echo ✓ Cache node_modules supprimé
) else (
    echo ⚠ Cache node_modules introuvable
)
echo.

echo [3/5] Suppression du cache turbo...
if exist .turbo (
    rd /s /q .turbo
    echo ✓ Cache turbo supprimé
) else (
    echo ⚠ Cache turbo introuvable
)
echo.

echo [4/5] Reconstruction complète de l'application...
call npm run build
echo.

echo [5/5] Démarrage du serveur de développement...
echo.
echo ========================================
echo ⚠ INSTRUCTIONS IMPORTANTES
echo ========================================
echo 1. Ouvrez votre navigateur
echo 2. Appuyez sur F12 (DevTools)
echo 3. Clic droit sur Actualiser
echo 4. Sélectionnez "Vider le cache et actualiser de force"
echo 5. Déconnectez-vous et reconnectez-vous
echo ========================================
echo.

call npm run dev
```

---

## 📋 RÉSULTAT ATTENDU APRÈS NETTOYAGE

### Dashboard Propriétaire - Structure PHARMACIE
**Doit afficher 15 modules:**

1. Dashboard ✅
2. Structures & Équipe ✅
3. Stock ✅ (PHARMACIE)
4. Médicaments ✅ (PHARMACIE)
5. Vente ✅ (PHARMACIE)
6. Caisse ✅ (PHARMACIE)
7. Approvisionnement ✅ (PHARMACIE)
8. Inventaire ✅ (PHARMACIE)
9. Péremption ✅ (PHARMACIE)
10. Historique ✅ (PHARMACIE)
11. Alertes ✅ (PHARMACIE)
12. Statistiques ✅ (PHARMACIE)
13. Horaires ✅ (PHARMACIE)
14. Notifications ✅ (PHARMACIE)
15. Messagerie ✅ (Exclusif propriétaire)
16. Profil ✅ (Toujours visible)
17. Paramètres ✅ (Toujours visible)

**Modules HOPITAL cachés:**
- Services Médicaux ❌
- Plateaux Techniques ❌
- Prises en Charge ❌

### Dashboard Propriétaire - Structure HOPITAL
**Doit afficher 6 modules de base + 3 modules hôpital:**

1. Dashboard ✅
2. Structures & Équipe ✅
3. Services Médicaux ✅ (HOPITAL)
4. Plateaux Techniques ✅ (HOPITAL)
5. Prises en Charge ✅ (HOPITAL)
6. Messagerie ✅ (Exclusif propriétaire)
7. Profil ✅
8. Paramètres ✅

**Modules PHARMACIE cachés:**
- Stock, Médicaments, Vente, etc. ❌

---

## 🔍 DÉBOGAGE SI LE PROBLÈME PERSISTE

### Console du Navigateur
Ouvrir DevTools (F12) et chercher:

```
[PERMISSION CHECK] { item: 'Stock', module: 'STOCK', ... }
```

**Si ces logs n'apparaissent pas:** React Query ne refetch pas les permissions.

**Solution:**
1. Aller dans DevTools > Application > Storage
2. Cliquer "Clear site data"
3. Rafraîchir la page

### Vérifier le Type de Structure
Dans la console navigateur:
```javascript
// Voir la structure chargée
localStorage.getItem('structure')

// Ou via React Query DevTools
// Chercher queryKey: ["structures", "me"]
```

**Attendu:**
```json
{
  "id": "...",
  "type": "PHARMACIE", // ou "HOPITAL"
  "statut": "ACTIVE"
}
```

### Vérifier le Filtrage
Ajouter des logs temporaires dans `useDashboardNavigation.ts`:

```typescript
console.log('[DEBUG] Structure Type:', structureType);
console.log('[DEBUG] Base Navigation:', baseNavigation.length);
console.log('[DEBUG] Filtered Navigation:', filteredByType.length);
```

---

## 📝 PROCHAINES ÉTAPES

### Une fois le Dashboard Propriétaire Fixé

**Tester les Permissions Membres:**
1. En tant que propriétaire, assigner des permissions à un membre
2. Se déconnecter
3. Se connecter en tant que membre
4. Vérifier que les modules assignés apparaissent dans la sidebar

**Console logs attendus:**
```
[PERMISSION CHECK] { item: 'Stock', module: 'STOCK', hasPermission: true }
[PERMISSION CHECK] { item: 'Vente', module: 'VENTE', hasPermission: true }
```

---

## ⚙️ MODIFICATIONS PERMANENTES APPLIQUÉES

### 1. Réduction du staleTime (À FAIRE)
- **Fichier:** `useMyStructure.ts`
- **Avant:** `staleTime: 10 * 60 * 1000` (10 min)
- **Après:** `staleTime: 30 * 1000` (30 sec)

### 2. Filtrage par Type de Structure (FAIT ✅)
- **Fichier:** `useDashboardNavigation.ts`
- **Ajout:** Filtrage `item.structureType === structureType`

### 3. Tags structureType sur Modules (FAIT ✅)
- **Fichier:** `owner-navigation.ts`
- **Ajout:** `structureType: "PHARMACIE"` ou `"HOPITAL"` sur chaque module

### 4. Type TypeScript structureType (FAIT ✅)
- **Fichier:** `types.ts`
- **Ajout:** `structureType?: "PHARMACIE" | "HOPITAL"`

---

## 🎯 COMMANDE RAPIDE

**Exécuter en 1 clic:**
```cmd
NETTOYER_CACHE_COMPLET.bat
```

Puis dans le navigateur:
1. F12
2. Ctrl+Shift+R
3. Logout/Login

---

## 📞 CONTACT SI PROBLÈME PERSISTE

Si après ces étapes le problème persiste:
1. Copier la sortie de la console navigateur (F12)
2. Copier la sortie du terminal où tourne `npm run dev`
3. Vérifier la réponse de l'API `/structures/me/` dans l'onglet Network

**Fichier de log:** `DEBUG_SIDEBAR.txt`
