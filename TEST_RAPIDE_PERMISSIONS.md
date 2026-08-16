# Test Rapide - Permissions Dashboard Dynamique

## 🎯 Objectif
Vérifier que les deux problèmes sont résolus :
1. ✅ Tous les modules sont visibles dans le dashboard propriétaire
2. ✅ Les permissions assignées apparaissent dans le dashboard des membres

---

## 🚀 Démarrage Rapide

### 1. Lancer les Serveurs
```bash
# Terminal 1 : Backend
cd backend
py manage.py runserver

# Terminal 2 : Frontend  
cd frontend
npm run dev
```

### 2. Ouvrir le Navigateur
- URL : http://localhost:3000
- Ouvrir DevTools (F12) → Console

---

## ✅ Test 1 : Vérifier Dashboard Propriétaire

### Étapes
1. Se connecter avec compte **PROPRIETAIRE**
2. Aller sur le dashboard `/owner`
3. **Vérifier sidebar gauche**

### Résultat Attendu
La sidebar doit contenir **19 items** au total :

```
Dashboard
Structures & Équipe

--- Modules Pharmacie ---
Stock
Médicaments
Vente
Caisse
Approvisionnement
Inventaire
Péremption
Historique
Alertes
Statistiques
Horaires
Notifications

--- Modules Hôpital ---
Services Médicaux
Plateaux Techniques
Prises en Charge

--- Exclusif ---
Messagerie

--- Toujours Visibles ---
Profil
Paramètres
```

### ✅ Validation
- [ ] Tous les 19 items sont visibles
- [ ] "Horaires" est présent
- [ ] "Notifications" est présent
- [ ] "Services Médicaux" est présent
- [ ] "Plateaux Techniques" est présent
- [ ] "Prises en Charge" est présent
- [ ] "Profil" n'est pas en double
- [ ] "Messagerie" est avant Profil/Paramètres

---

## ✅ Test 2 : Assigner des Permissions

### Étapes
1. Rester connecté en tant que **PROPRIETAIRE**
2. Aller dans **Structures & Équipe** (`/owner/team`)
3. Sélectionner une structure
4. Si aucun membre : créer un nouveau membre
   - Nom : Test User
   - Email : test@example.com
   - Role : Assistant (ou laisser vide)
5. Scroller vers **Permissions du membre**
6. Sélectionner le membre dans le dropdown
7. Cocher les permissions suivantes :
   ```
   ☑ STOCK
     ☑ CONSULTER
     ☑ CREER
   
   ☑ VENTE
     ☑ CONSULTER
     ☑ CREER
   
   ☑ CAISSE
     ☑ CONSULTER
     ☑ VALIDER_PAIEMENT
   ```
8. Cliquer **Enregistrer les permissions**

### Résultat Attendu
- ✅ Message : "Permissions mises à jour."
- ✅ Les cases restent cochées après sauvegarde

### ✅ Validation
- [ ] Permissions sauvegardées sans erreur
- [ ] Message de succès affiché

---

## ✅ Test 3 : Vérifier Dashboard Membre (CRITIQUE)

### Étapes
1. Se déconnecter du compte proprietaire
2. Si le membre test n'a pas encore de compte :
   - Aller sur `/inscription`
   - Entrer l'email : test@example.com
   - Valider l'OTP (généré dans backend)
   - Créer mot de passe
3. Se connecter avec le compte membre
4. **Vérifier la redirection** → `/pharmacy`
5. **Ouvrir DevTools (F12) → Console**
6. **Observer la sidebar gauche**

### Résultat Attendu - Sidebar
La sidebar doit contenir **UNIQUEMENT** :

```
Dashboard              ← Toujours visible
Stock                  ← Permission CONSULTER
Vente                  ← Permission CONSULTER
Caisse                 ← Permission CONSULTER
Profil                 ← Toujours visible
Paramètres             ← Toujours visible
```

**Ne DOIT PAS contenir** :
```
❌ Approvisionnement   (pas de permission)
❌ Inventaire          (pas de permission)
❌ Péremption          (pas de permission)
❌ Historique          (pas de permission)
❌ Alertes             (pas de permission)
❌ Statistiques        (pas de permission)
❌ Messagerie          (exclusif proprietaire)
```

### Résultat Attendu - Console
Dans la console DevTools, vous devriez voir des logs comme :

```javascript
[PERMISSION CHECK] {
  item: "Stock",
  module: "STOCK",
  action: "CONSULTER",
  hasPermission: true,          ← ✅ TRUE
  permissions: ["CONSULTER", "CREER"]
}

[PERMISSION CHECK] {
  item: "Vente",
  module: "VENTE",
  action: "CONSULTER",
  hasPermission: true,          ← ✅ TRUE
  permissions: ["CONSULTER", "CREER"]
}

[PERMISSION CHECK] {
  item: "Caisse",
  module: "CAISSE",
  action: "CONSULTER",
  hasPermission: true,          ← ✅ TRUE
  permissions: ["CONSULTER", "VALIDER_PAIEMENT"]
}

[PERMISSION CHECK] {
  item: "Approvisionnement",
  module: "APPROVISIONNEMENT",
  action: "CONSULTER",
  hasPermission: false,         ← ✅ FALSE (correct)
  permissions: undefined
}
```

### ✅ Validation
- [ ] Sidebar affiche UNIQUEMENT les 6 items
- [ ] Stock est visible
- [ ] Vente est visible
- [ ] Caisse est visible
- [ ] Approvisionnement est INVISIBLE
- [ ] Inventaire est INVISIBLE
- [ ] Messagerie est INVISIBLE
- [ ] Profil est visible
- [ ] Paramètres est visible
- [ ] Console affiche `[PERMISSION CHECK]` logs
- [ ] `hasPermission: true` pour modules assignés
- [ ] `hasPermission: false` pour modules non assignés

---

## ✅ Test 4 : API Response

### Étapes
1. Rester connecté en tant que **membre**
2. Ouvrir DevTools (F12) → **Network**
3. Filtrer sur : `permissions`
4. Rafraîchir la page (F5)
5. Chercher requête : `GET /structures/me/permissions/`
6. Cliquer dessus → **Response**

### Résultat Attendu
```json
{
  "structure_id": "uuid-de-la-structure",
  "full_access": false,
  "modules": {
    "STOCK": ["CONSULTER", "CREER"],
    "VENTE": ["CONSULTER", "CREER"],
    "CAISSE": ["CONSULTER", "VALIDER_PAIEMENT"]
  }
}
```

### ✅ Validation
- [ ] Réponse HTTP 200 OK
- [ ] `full_access: false`
- [ ] `modules` contient exactement 3 clés
- [ ] STOCK, VENTE, CAISSE présents
- [ ] Actions correspondent aux permissions assignées

---

## ❌ Si Problème : Diagnostics

### Problème A : Modules Manquants dans Owner Sidebar

**Symptôme :** Moins de 19 items dans sidebar proprietaire

**Actions :**
1. Vérifier build frontend :
   ```bash
   cd frontend
   npm run build
   ```
2. Si erreur TypeScript → copier message
3. Vérifier fichier : `frontend/src/features/shared/dashboard/navigation/owner-navigation.ts`
4. Chercher : `Horaires`, `Notifications`, `Services Médicaux`

### Problème B : Permissions Non Visibles dans Membre Sidebar

**Symptôme :** Sidebar vide ou seulement Dashboard/Profil/Paramètres

**Diagnostic Console :**
```javascript
// Si vous voyez :
[PERMISSION CHECK] {
  hasPermission: false  // ❌ Devrait être true
}

// Copier TOUS les logs [PERMISSION CHECK]
```

**Diagnostic Network :**
1. Vérifier `/structures/me/permissions/`
2. Si `modules: {}` → Problème backend
3. Si modules corrects → Problème filtrage frontend

**Actions :**
1. Copier console logs complets
2. Copier réponse API `/structures/me/permissions/`
3. Copier screenshot de sidebar
4. Me fournir ces informations

### Problème C : Erreur API 404 ou 403

**Symptôme :** Requête `/structures/me/permissions/` échoue

**Actions :**
1. Vérifier que membre est bien lié à structure
2. Backend Django shell :
   ```python
   from structures.models import EquipeStructure
   membre = EquipeStructure.objects.filter(
       utilisateur__email="test@example.com"
   ).first()
   print(membre.structure.nom)
   ```
3. Vérifier token JWT valide
4. Vérifier utilisateur actif : `is_active=True`

---

## 📊 Résumé des Validations

### ✅ Test 1 : Owner Sidebar
- [ ] 19 items visibles
- [ ] Tous les modules présents

### ✅ Test 2 : Assigner Permissions
- [ ] Permissions sauvegardées
- [ ] Message de succès

### ✅ Test 3 : Membre Sidebar
- [ ] 6 items visibles (3 modules + dashboard/profil/paramètres)
- [ ] Modules assignés visibles
- [ ] Modules non assignés invisibles
- [ ] Console logs corrects

### ✅ Test 4 : API Response
- [ ] HTTP 200
- [ ] Modules corrects
- [ ] Actions correctes

---

## 🎉 Résultat Attendu Final

**Si tous les tests passent :**
- ✅ Dashboard proprietaire affiche TOUS les modules
- ✅ Permissions assignées apparaissent dans sidebar membre
- ✅ Modules non assignés n'apparaissent PAS
- ✅ Profil et Paramètres toujours visibles
- ✅ Messagerie exclusif proprietaire

**Système de permissions dynamique fonctionnel à 100% !**

---

## 📞 En Cas de Problème

Si un test échoue, me fournir :
1. **Screenshot** de la sidebar
2. **Console logs** complets (F12 → Console)
3. **Network response** de `/structures/me/permissions/`
4. **Message d'erreur** exact (si applicable)

Je pourrai alors diagnostiquer précisément le problème.

---

**Date :** 15 août 2026  
**Status :** ✅ Corrections appliquées, prêt pour test
