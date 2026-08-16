# Guide de Résolution - Sidebar Propriétaire

## 🎯 Objectif
Afficher **tous les modules** dans la sidebar du propriétaire, filtrés selon le type de structure (PHARMACIE ou HOPITAL).

## ✅ Ce qui a été fait

### 1. Code Source Modifié ✅
- ✅ `owner-navigation.ts` - 19 modules avec tags `structureType`
- ✅ `useDashboardNavigation.ts` - Filtrage par type de structure
- ✅ `useMyStructure.ts` - Réduction du cache (30s au lieu de 10min)
- ✅ `types.ts` - Ajout du champ `structureType`

### 2. Modules Ajoutés ✅
**Modules PHARMACIE (14):**
- Stock, Médicaments, Vente, Caisse
- Approvisionnement, Inventaire, Péremption
- Historique, Alertes, Statistiques
- Horaires, Notifications

**Modules HOPITAL (3):**
- Services Médicaux
- Plateaux Techniques
- Prises en Charge

**Modules Universels (5):**
- Dashboard
- Structures & Équipe
- Messagerie (propriétaire uniquement)
- Profil
- Paramètres

### 3. Logs de Debug Ajoutés ✅
Console navigateur affichera:
```
[NAVIGATION DEBUG] {
  type: "OWNER",
  structureType: "PHARMACIE",
  baseNavigationCount: 19,
  userRole: "PROPRIETAIRE"
}
[NAVIGATION DEBUG] Après filtrage structureType: {
  filteredCount: 17,
  items: [...]
}
[NAVIGATION DEBUG] Navigation finale: {
  finalCount: 17,
  items: ["Dashboard", "Structures & Équipe", ...]
}
```

---

## 🚀 ÉTAPES DE RÉSOLUTION

### ÉTAPE 1: Vérifier les Fichiers Sources

**Exécuter:**
```cmd
VERIFIER_FICHIERS.bat
```

**Attendu:**
- owner-navigation.ts: ~184 lignes
- ~19 modules avec label
- ~14 modules PHARMACIE
- ~3 modules HOPITAL
- staleTime: 30 * 1000

**Si les chiffres sont incorrects:** Le code n'a pas été sauvegardé correctement.

**Si les chiffres sont corrects mais interface ne change pas:** C'est un problème de cache (passer à ÉTAPE 2).

---

### ÉTAPE 2: Nettoyer Tous les Caches

#### A. Cache Next.js (OBLIGATOIRE)

**Exécuter:**
```cmd
NETTOYER_CACHE_COMPLET.bat
```

**Ce qui se passe:**
1. Suppression `.next/` (cache de compilation)
2. Suppression `node_modules/.cache/`
3. Suppression `.turbo/` (si Turbo utilisé)
4. Reconstruction complète (`npm run build`)
5. Démarrage du dev server (`npm run dev`)

**Temps estimé:** 2-5 minutes selon la machine.

#### B. Cache Navigateur (OBLIGATOIRE)

**Dans le navigateur:**
1. Appuyer sur **F12** (DevTools)
2. Onglet **Network**
3. Cocher **"Disable cache"**
4. Clic droit sur bouton Actualiser
5. Sélectionner **"Vider le cache et actualiser de force"**
6. Ou **Ctrl+Shift+R**

#### C. Storage Navigateur (RECOMMANDÉ)

**Dans DevTools:**
1. Onglet **Application**
2. Section **Storage**
3. Cliquer **"Clear site data"**
4. Confirmer

**Ou manuellement supprimer:**
- Local Storage
- Session Storage
- Cookies
- Cache Storage
- IndexedDB

#### D. React Query Cache (OBLIGATOIRE)

**Se déconnecter et reconnecter:**
1. Cliquer "Déconnexion"
2. Fermer tous les onglets de l'application
3. Ouvrir un nouvel onglet
4. Se reconnecter

**Pourquoi?** Force React Query à refetch toutes les données (structure, permissions, etc.).

---

### ÉTAPE 3: Vérifier les Logs Console

**Ouvrir DevTools (F12) > Console**

**Logs attendus au chargement du dashboard:**

```
[NAVIGATION DEBUG] {
  type: "OWNER",
  structureType: "PHARMACIE",  // ou "HOPITAL"
  baseNavigationCount: 19,
  userRole: "PROPRIETAIRE"
}

[NAVIGATION DEBUG] Après filtrage structureType: {
  filteredCount: 17,  // 14 PHARMACIE + 3 universels (Dashboard, Team, Messagerie)
  items: [
    { label: "Dashboard", structureType: undefined },
    { label: "Structures & Équipe", structureType: undefined },
    { label: "Stock", structureType: "PHARMACIE" },
    { label: "Médicaments", structureType: "PHARMACIE" },
    ...
  ]
}

[NAVIGATION DEBUG] Navigation finale: {
  finalCount: 17,
  items: ["Dashboard", "Structures & Équipe", "Stock", "Médicaments", ...]
}
```

**Si `structureType: undefined`:**
- React Query n'a pas refetch `/structures/me/`
- Retour ÉTAPE 2D (déconnexion/reconnexion)

**Si `baseNavigationCount: 5`:**
- Le fichier `owner-navigation.ts` n'a pas été recompilé
- Retour ÉTAPE 2A (rebuild complet)

---

### ÉTAPE 4: Vérifier l'API

**Dans DevTools > Network:**
1. Filtrer par "me"
2. Chercher la requête **`/structures/me/`**
3. Vérifier la réponse

**Réponse attendue:**
```json
{
  "id": "uuid-here",
  "type": "PHARMACIE",  // ou "HOPITAL"
  "statut": "ACTIVE",
  "nom": "Ma Pharmacie",
  ...
}
```

**Si `type` est absent ou incorrect:**
- Problème backend
- Vérifier la base de données

**Si requête n'apparaît pas:**
- React Query utilise le cache
- Retour ÉTAPE 2D (déconnexion)

---

## 🔍 DIAGNOSTIC AVANCÉ

### Problème: Toujours 5 Modules Après Nettoyage

#### Test 1: Vérifier le Hook
Ajouter temporairement dans `useDashboardNavigation.ts`:

```typescript
useEffect(() => {
  console.log('[DEBUG] useMyStructure data:', myStructure);
  console.log('[DEBUG] structureType:', structureType);
}, [myStructure, structureType]);
```

**Si `myStructure: undefined`:**
- Le hook `useMyStructure` n'a pas chargé les données
- Vérifier que l'utilisateur est bien connecté
- Vérifier l'API `/structures/me/`

#### Test 2: Forcer le Rechargement
Dans `useMyStructure.ts`, ajouter temporairement:

```typescript
staleTime: 0, // Force refetch à chaque render
refetchOnMount: 'always',
refetchOnWindowFocus: true,
```

**Rebuild et tester.**

#### Test 3: Vérifier le Filtrage
Dans la console navigateur:

```javascript
// Voir tous les items de base
console.log(ownerNavigation.length); // Doit être 19

// Voir le filtrage
const filtered = ownerNavigation.filter(item => 
  !item.structureType || item.structureType === "PHARMACIE"
);
console.log(filtered.length); // Doit être 17 pour PHARMACIE
```

---

## 📊 Résultats Attendus

### Pour Structure PHARMACIE

**Sidebar doit afficher (17 items):**
1. Dashboard
2. Structures & Équipe
3. Stock
4. Médicaments
5. Vente
6. Caisse
7. Approvisionnement
8. Inventaire
9. Péremption
10. Historique
11. Alertes
12. Statistiques
13. Horaires
14. Notifications
15. Messagerie
16. Profil
17. Paramètres

**Ne doit PAS afficher:**
- Services Médicaux ❌
- Plateaux Techniques ❌
- Prises en Charge ❌

### Pour Structure HOPITAL

**Sidebar doit afficher (8 items):**
1. Dashboard
2. Structures & Équipe
3. Services Médicaux
4. Plateaux Techniques
5. Prises en Charge
6. Messagerie
7. Profil
8. Paramètres

**Ne doit PAS afficher:**
- Stock, Médicaments, Vente, etc. ❌

---

## 🐛 Si Problème Persiste

### Collecter les Informations

**1. Console Navigateur (F12):**
Copier tous les logs `[NAVIGATION DEBUG]` et `[PERMISSION CHECK]`

**2. Network Tab:**
Copier la réponse de `/structures/me/`

**3. React Query DevTools:**
Installer si pas déjà fait:
```bash
npm install @tanstack/react-query-devtools
```

Chercher la query `["structures", "me"]` et copier les données.

**4. Terminal Frontend:**
Copier les dernières lignes du terminal où tourne `npm run dev`

**5. Fichier de Diagnostic:**
Créer `DEBUG_SIDEBAR.txt` avec:
- Logs console
- Réponse API
- État React Query
- Sortie terminal

---

## 🎯 Commande Rapide - Tout en 1

```cmd
cd c:\Users\Lionnel\Desktop\cours\projet de stage L2
NETTOYER_CACHE_COMPLET.bat
```

**Puis dans le navigateur:**
1. F12
2. Ctrl+Shift+R (vider cache)
3. Application > Clear site data
4. Déconnexion
5. Reconnexion
6. Vérifier les logs console

---

## 📞 Checklist Finale

- [ ] Fichiers sources vérifiés (VERIFIER_FICHIERS.bat)
- [ ] Cache Next.js nettoyé (.next supprimé)
- [ ] Rebuild complet effectué (npm run build)
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Storage navigateur nettoyé (Clear site data)
- [ ] Déconnexion/Reconnexion effectuée
- [ ] Logs console vérifiés ([NAVIGATION DEBUG])
- [ ] API `/structures/me/` vérifiée (type présent)
- [ ] Nombre de modules dans sidebar compté

**Si toutes les cases cochées et problème persiste:**
Créer `DEBUG_SIDEBAR.txt` avec toutes les informations collectées.
