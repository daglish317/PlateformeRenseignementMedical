# 📋 PLAN DE VÉRIFICATION - Carte (verification.md)

## 🎯 ANALYSE DU FICHIER verification.md

### ✅ DÉJÀ IMPLÉMENTÉ

1. **Technologies** ✅
   - Leaflet (react-leaflet)
   - OpenStreetMap (via CARTO tiles)
   - Géolocalisation HTML5

2. **Position utilisateur** ✅
   - Composant `UserMarker.tsx` existe
   - Géolocalisation dans `geolocalisation` service

3. **Types de structures** ✅
   - Hôpitaux
   - Pharmacies

4. **Marqueurs** ✅
   - Composant `StructureMarker.tsx` existe
   - Popups implémentées

5. **Contrôles** ✅
   - Composant `MapControls.tsx` existe

6. **Synchronisation Carte ↔ Liste** ✅
   - Store `structure-selection-store` existe

7. **Itinéraire** ✅
   - Composant `RouteLayer.tsx` existe
   - Store `routing-store` existe

---

## ⚠️ À VÉRIFIER/AMÉLIORER

### PRIORITÉ 1: Point NB (CRITIQUE)

**Exigence:**
> la carte ne doit plus être noir en mode sombre ou blanc en mode claire
> elle doit ressembler à google map
> elle doit ressortir le paysage avec ses couleurs naturelles
> et doit zoomer au maximum possible
> on doit pouvoir distinguer les bâtiments, les routes et autre

**Statut actuel:**
- ✅ Mode clair utilise "Voyager" (couleurs naturelles)
- ❌ Mode sombre utilise "dark_all" (tout noir)
- ❌ maxZoom = 18 (devrait être 19-20 pour voir les bâtiments)

**À faire:**
1. Utiliser "Voyager" même en mode sombre (ou variante colorée)
2. Augmenter maxZoom à 19-20
3. Tester la visibilité des bâtiments

---

### PRIORITÉ 2: Z-index carte vs suggestions

**Exigence:**
> la carte doit être en bas de card de suggestion de recherche
> donc bien régler l'index de ces éléments

**Statut:**
- ✅ SearchDropdown = z-[1200]
- ✅ MapControls = z-[1000]
- ✅ Hiérarchie correcte

---

### PRIORITÉ 3: Fonctionnalités à vérifier

1. **Chargement initial (Points 3-4)**
   - [ ] Demande autorisation localisation
   - [ ] Centre sur utilisateur
   - [ ] Affiche structures autour
   - [ ] Fallback si refus

2. **Recherche (Points 11-15)**
   - [ ] Réaction instantanée à la recherche
   - [ ] Recherche par maladie → hôpitaux uniquement
   - [ ] Recherche par médicament → pharmacies uniquement
   - [ ] Centre automatique sur résultat

3. **Synchronisation (Points 16-17)**
   - [ ] Carte ↔ Liste bidirectionnelle
   - [ ] Barre de recherche pilote la carte

4. **Zoom automatique (Point 18)**
   - [ ] Ajustement auto après recherche

5. **Popup (Points 9-10)**
   - [ ] Nom, type, adresse, distance, temps
   - [ ] Bouton "Voir la fiche"
   - [ ] Bouton "Itinéraire"

6. **Performances (Point 28)**
   - [ ] Chargement rapide
   - [ ] Affichage résultats utiles uniquement

7. **Responsive (Points 29-30)**
   - [ ] Mobile: carte prioritaire
   - [ ] Liste en panneau coulissant
   - [ ] Contrôles accessibles

8. **Gestion erreurs (Point 33)**
   - [ ] GPS indisponible
   - [ ] Connexion perdue
   - [ ] Messages appropriés

---

## 🔨 ACTIONS À RÉALISER

### Action 1: Corriger le mode sombre (PRIORITÉ NB)

**Fichier:** `frontend/src/components/map/MapView.tsx`

**Changement:**
```typescript
// AVANT
const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const isDark = mounted && resolvedTheme === "dark";
const tileUrl = isDark ? DARK_TILES : LIGHT_TILES;

// APRÈS
// Utiliser Voyager pour les deux modes (couleurs naturelles)
const TILES_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
```

**Raison:** Voyager affiche les couleurs naturelles (routes, parcs, eau) même en mode sombre

---

### Action 2: Augmenter le zoom maximum

**Fichier:** `frontend/src/constants/map.ts` (ou dans MapView.tsx)

**Changement:**
```typescript
// AVANT
maxZoom: 18

// APRÈS
maxZoom: 20  // Permet de voir les bâtiments individuels
```

---

### Action 3: Vérifier les autres points

Créer des tests pour vérifier:
- Chargement initial
- Recherche et filtrage
- Synchronisation
- Responsive

---

## 📊 CHECKLIST DÉTAILLÉE

### Fonctionnalités de base
- [x] 1. Carte comme interface principale
- [x] 2. Technologies (Leaflet + OSM)
- [ ] 3. Chargement initial avec géolocalisation
- [x] 4. Position utilisateur visible
- [x] 5. Types de structures (hôpitaux, pharmacies)
- [ ] 6. Icônes différentes par type
- [ ] 7. Couleurs cohérentes
- [x] 8. Marqueurs par structure
- [ ] 9. Popup complète
- [ ] 10. Fiche détaillée

### Recherche
- [ ] 11. Réaction instantanée
- [ ] 12. Recherche par maladie (hôpitaux)
- [ ] 13. Recherche par médicament (pharmacies)
- [ ] 14. Recherche par nom
- [ ] 15. Résultats multiples numérotés

### Synchronisation
- [ ] 16. Carte ↔ Liste
- [ ] 17. Barre recherche ↔ Carte
- [ ] 18. Zoom automatique
- [ ] 19. Déplacement manuel

### Itinéraire
- [x] 20. Affichage itinéraire
- [ ] 21. Temps de trajet
- [ ] 22. Types de transport

### Fonctionnalités avancées
- [ ] 23. Structures proches
- [ ] 24. Mode urgence
- [ ] 25. Actualisation
- [ ] 26. Gestion stocks
- [ ] 27. Gestion prises en charge
- [ ] 28. Performances
- [ ] 29-30. Responsive mobile
- [x] 31. Contrôles carte
- [ ] 32. État vide
- [ ] 33. Gestion erreurs
- [ ] 34. Architecture modulaire

### Point NB (CRITIQUE)
- [ ] Carte avec couleurs naturelles en mode sombre
- [ ] Zoom maximum 19-20
- [ ] Bâtiments visibles
- [ ] Routes visibles
- [x] Z-index correct (sous les suggestions)

---

## 🎯 PLAN D'ACTION

### Étape 1: Corrections critiques (Point NB)
1. Modifier MapView.tsx pour Voyager en mode sombre
2. Augmenter maxZoom à 20
3. Tester visibilité bâtiments

### Étape 2: Vérifier composants existants
1. Lire tous les composants map
2. Vérifier fonctionnalités implémentées
3. Identifier ce qui manque

### Étape 3: Implémenter ce qui manque
1. Selon la liste ci-dessus
2. Sans casser l'existant
3. Tester après chaque changement

### Étape 4: Tests finaux
1. Test visuel carte
2. Test fonctionnalités
3. Test responsive
4. Test erreurs

---

## 📝 NOTES

- Ne pas casser les fonctionnalités existantes
- Tester après chaque modification
- Documenter les changements
- Vérifier la compatibilité mobile

