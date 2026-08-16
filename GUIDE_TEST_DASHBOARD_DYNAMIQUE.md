# Guide de Test - Dashboard Pharmacie Dynamique

## 🎯 Objectif

Ce guide vous permet de tester complètement le nouveau système de dashboards dynamiques pour les pharmacies. Suivez chaque étape et vérifiez que tout fonctionne correctement.

---

## ⚙️ Prérequis

1. Backend Django en fonctionnement
2. Frontend Next.js compilé (`npm run build` réussi ✅)
3. Base de données avec au moins:
   - 1 utilisateur PROPRIETAIRE
   - 1 structure PHARMACIE créée

---

## 📋 Plan de Test

### PHASE 1: Préparation (Propriétaire)

#### Test 1.1: Créer une Structure Pharmacie
1. Se connecter en tant que **PROPRIETAIRE**
2. Aller sur `/owner/team`
3. Créer une nouvelle pharmacie:
   - Nom: "Pharmacie Test Dashboard"
   - Type: PHARMACIE
   - Adresse: "123 Rue Test"
   - Téléphone: "0123456789"
4. ✅ **Vérification**: La structure apparaît dans le dropdown

#### Test 1.2: Inviter des Membres
1. Sélectionner la structure créée
2. Inviter un GESTIONNAIRE:
   - Nom: "Jean Dupont"
   - Email: "gestionnaire@test.com"
   - Rôle: GESTIONNAIRE
3. Inviter un CAISSIER:
   - Nom: "Marie Martin"
   - Email: "caissier@test.com"
   - Rôle: CAISSIER
4. ✅ **Vérification**: Les deux membres apparaissent dans le tableau

---

### PHASE 2: Configuration Permissions (Propriétaire)

#### Test 2.1: Permissions GESTIONNAIRE
1. Dans la section "Permissions du membre", sélectionner **Jean Dupont**
2. Activer les modules suivants:

   **Opérations métier**
   - ☑ STOCK: Consulter, Modifier, Exporter
   - ☑ APPROVISIONNEMENT: Consulter, Créer, Modifier
   - ☑ VENTE: Consulter, Créer
   - ☐ CAISSE: (Laisser décoché)

   **Suivi et contrôle**
   - ☑ INVENTAIRE: Consulter, Créer
   - ☑ HISTORIQUE: Consulter, Filtrer
   - ☑ STATISTIQUES: Consulter
   - ☐ ALERTES: (Laisser décoché)
   - ☐ PEREMPTION: (Laisser décoché)

   **Gestion et accès**
   - ☑ HORAIRES: Consulter
   - ☑ NOTIFICATIONS: Consulter
   - ☑ PROFIL: Consulter, Modifier (pré-sélectionné)
   - ☑ PARAMETRES: Consulter, Modifier (pré-sélectionné)

3. Cliquer sur **Enregistrer**
4. ✅ **Vérification**: Message de succès affiché

#### Test 2.2: Permissions CAISSIER
1. Sélectionner **Marie Martin** dans le dropdown
2. Activer UNIQUEMENT:

   **Opérations métier**
   - ☑ VENTE: Consulter, Créer
   - ☑ CAISSE: Toutes les actions

   **Suivi et contrôle**
   - ☑ HISTORIQUE: Consulter

   **Gestion et accès**
   - ☑ PROFIL: Consulter, Modifier (pré-sélectionné)
   - ☑ PARAMETRES: Consulter, Modifier (pré-sélectionné)

3. Cliquer sur **Enregistrer**
4. ✅ **Vérification**: Message de succès affiché

#### Test 2.3: Vérifier Messagerie Absente
1. Parcourir toute la liste des modules dans l'éditeur de permissions
2. ✅ **Vérification**: **MESSAGERIE n'apparaît NULLE PART**

---

### PHASE 3: Test Propriétaire

#### Test 3.1: Navigation Propriétaire Complète
1. Vérifier la sidebar du propriétaire (`/owner`)
2. ✅ **Vérification**: Tous ces modules sont visibles:
   - Dashboard
   - Profil
   - Structures & Équipe
   - Stock
   - Médicaments
   - Vente
   - Caisse
   - Approvisionnement
   - Inventaire
   - Péremption
   - Historique
   - Alertes
   - Statistiques
   - **Messagerie** ⭐ (exclusif)
   - Paramètres

#### Test 3.2: Accès Messagerie Propriétaire
1. Cliquer sur **Messagerie** dans la sidebar
2. ✅ **Vérification**: Page `/owner/chat` accessible
3. ✅ **Vérification**: Aucune erreur 403

---

### PHASE 4: Test GESTIONNAIRE

#### Test 4.1: Inscription et Activation
1. Se déconnecter du compte propriétaire
2. Aller sur `/inscription`
3. S'inscrire avec l'email: **gestionnaire@test.com**
4. Compléter le profil
5. ✅ **Vérification**: Redirection vers `/pharmacy`

#### Test 4.2: Vérifier Sidebar Dynamique
1. Observer la sidebar
2. ✅ **Vérification**: UNIQUEMENT ces modules sont visibles:
   - Dashboard
   - **Stock** ✅
   - Médicaments ✅
   - **Vente** ✅
   - Approvisionnement ✅
   - **Inventaire** ✅
   - Historique ✅
   - **Statistiques** ✅
   - Horaires ✅
   - Notifications ✅
   - **Profil** ✅ (toujours visible)
   - **Paramètres** ✅ (toujours visible)

3. ❌ **Vérification**: Ces modules NE SONT PAS visibles:
   - Caisse (permission non accordée)
   - Alertes (permission non accordée)
   - Péremption (permission non accordée)
   - **Messagerie** (exclusif propriétaire)

#### Test 4.3: Accès aux Modules Autorisés
1. Cliquer sur **Stock** → Accès OK ✅
2. Cliquer sur **Vente** → Accès OK ✅
3. Cliquer sur **Inventaire** → Accès OK ✅
4. Cliquer sur **Profil** → Accès OK ✅
5. Cliquer sur **Paramètres** → Accès OK ✅

#### Test 4.4: Bloquer Accès Modules Non Autorisés
1. Taper manuellement l'URL: `/pharmacy/caisse`
2. ✅ **Vérification**: Redirection automatique vers `/pharmacy`
3. Taper manuellement l'URL: `/pharmacy/alertes`
4. ✅ **Vérification**: Redirection automatique vers `/pharmacy`

#### Test 4.5: Bloquer Accès Messagerie
1. Taper manuellement l'URL: `/pharmacy/chat`
2. ✅ **Vérification**: Redirection vers `/pharmacy` (route bloquée)
3. ✅ **Vérification**: **Messagerie n'apparaît jamais dans la sidebar**

---

### PHASE 5: Test CAISSIER

#### Test 5.1: Inscription et Activation
1. Se déconnecter
2. S'inscrire avec l'email: **caissier@test.com**
3. Compléter le profil
4. ✅ **Vérification**: Redirection vers `/pharmacy` (même dashboard que GESTIONNAIRE)

#### Test 5.2: Vérifier Sidebar Restreinte
1. Observer la sidebar
2. ✅ **Vérification**: UNIQUEMENT ces modules sont visibles:
   - Dashboard
   - **Vente** ✅
   - **Caisse** ✅
   - Historique ✅
   - **Profil** ✅ (toujours visible)
   - **Paramètres** ✅ (toujours visible)

3. ❌ **Vérification**: Ces modules NE SONT PAS visibles:
   - Stock (permission non accordée)
   - Médicaments (permission non accordée)
   - Approvisionnement (permission non accordée)
   - Inventaire (permission non accordée)
   - Alertes (permission non accordée)
   - Péremption (permission non accordée)
   - Statistiques (permission non accordée)
   - Horaires (permission non accordée)
   - Notifications (permission non accordée)
   - **Messagerie** (exclusif propriétaire)

#### Test 5.3: Accès Modules Autorisés
1. Cliquer sur **Vente** → Accès OK ✅
2. Cliquer sur **Caisse** → Accès OK ✅
3. Cliquer sur **Historique** → Accès OK ✅
4. Cliquer sur **Profil** → Accès OK ✅
5. Cliquer sur **Paramètres** → Accès OK ✅

#### Test 5.4: Bloquer Accès Modules Non Autorisés
1. Taper manuellement l'URL: `/pharmacy/stock`
2. ✅ **Vérification**: Redirection automatique vers `/pharmacy`
3. Taper manuellement l'URL: `/pharmacy/inventaire`
4. ✅ **Vérification**: Redirection automatique vers `/pharmacy`
5. Taper manuellement l'URL: `/pharmacy/statistiques`
6. ✅ **Vérification**: Redirection automatique vers `/pharmacy`

#### Test 5.5: Bloquer Accès Messagerie
1. Taper manuellement l'URL: `/pharmacy/chat`
2. ✅ **Vérification**: Redirection vers `/pharmacy`
3. ✅ **Vérification**: **Messagerie n'apparaît JAMAIS dans la sidebar**

---

### PHASE 6: Modification Dynamique (Propriétaire)

#### Test 6.1: Retirer une Permission GESTIONNAIRE
1. Se reconnecter en tant que PROPRIETAIRE
2. Aller sur `/owner/team`
3. Sélectionner **Jean Dupont**
4. Décocher **VENTE** entièrement
5. Cliquer sur **Enregistrer**
6. ✅ **Vérification**: Message de succès

#### Test 6.2: Vérifier Impact Côté GESTIONNAIRE
1. Se reconnecter en tant que **gestionnaire@test.com**
2. Observer la sidebar
3. ✅ **Vérification**: **Vente n'est plus visible**
4. Taper manuellement l'URL: `/pharmacy/sale`
5. ✅ **Vérification**: Redirection vers `/pharmacy`

#### Test 6.3: Ajouter une Permission CAISSIER
1. Se reconnecter en tant que PROPRIETAIRE
2. Aller sur `/owner/team`
3. Sélectionner **Marie Martin**
4. Cocher **STATISTIQUES: Consulter**
5. Cliquer sur **Enregistrer**
6. ✅ **Vérification**: Message de succès

#### Test 6.4: Vérifier Impact Côté CAISSIER
1. Se reconnecter en tant que **caissier@test.com**
2. Observer la sidebar
3. ✅ **Vérification**: **Statistiques est maintenant visible**
4. Cliquer sur **Statistiques**
5. ✅ **Vérification**: Page accessible

---

### PHASE 7: Test Dashboard Hospitalier (Non-Régression)

#### Test 7.1: Créer Structure Hôpital
1. Se connecter en tant que PROPRIETAIRE
2. Créer une structure de type **HOPITAL**
3. Inviter un GESTIONNAIRE hospitalier

#### Test 7.2: Vérifier Aucune Modification
1. Se connecter avec le gestionnaire hospitalier
2. ✅ **Vérification**: Redirection vers `/hospital`
3. ✅ **Vérification**: Sidebar hôpital inchangée
4. ✅ **Vérification**: Aucune erreur, aucun bug
5. ✅ **Vérification**: Tous les modules hospitaliers fonctionnent normalement

---

## ✅ Checklist Finale

### Architecture
- [ ] GESTIONNAIRE redirigé vers `/pharmacy` ✅
- [ ] CAISSIER redirigé vers `/pharmacy` ✅
- [ ] Propriétaire a TOUS les modules pharmacie ✅
- [ ] Messagerie UNIQUEMENT visible au propriétaire ✅
- [ ] Profil et Paramètres TOUJOURS visibles ✅

### Permissions
- [ ] Interface de gestion claire et fonctionnelle ✅
- [ ] Modules groupés logiquement ✅
- [ ] Messagerie ABSENTE de l'éditeur ✅
- [ ] Sauvegarde des permissions fonctionne ✅
- [ ] Modifications visibles immédiatement ✅

### Sécurité
- [ ] URLs modules non autorisés bloquées ✅
- [ ] `/pharmacy/chat` toujours bloqué pour équipe ✅
- [ ] Profil/Paramètres toujours accessibles ✅
- [ ] Pas de contournement possible ✅

### UX
- [ ] Sidebar propre et claire ✅
- [ ] Pas de modules vides dans la sidebar ✅
- [ ] Feedback visuel sur les actions ✅
- [ ] Navigation fluide ✅
- [ ] Messages d'erreur clairs ✅

### Non-Régression
- [ ] Dashboard hospitalier intact ✅
- [ ] Dashboard admin intact ✅
- [ ] Aucune régression sur fonctionnalités existantes ✅

---

## 🐛 Problèmes Potentiels et Solutions

### Problème 1: Permissions ne se chargent pas
**Solution**: 
- Vérifier que l'utilisateur est bien ACTIF (statut = ACTIF)
- Vérifier la connexion backend
- Consulter les logs Django

### Problème 2: Redirection infinie
**Solution**:
- Vérifier que l'utilisateur a au moins une permission active
- Si aucune permission, le dashboard affiche un message clair

### Problème 3: Messagerie visible pour un membre
**Solution**:
- ⚠️ **BUG CRITIQUE** - Reporter immédiatement
- Vérifier `pharmacy-navigation.ts`
- Vérifier `route-permissions.ts`

### Problème 4: Module toujours visible malgré permission retirée
**Solution**:
- Rafraîchir la page (F5)
- Vider le cache navigateur
- Vérifier que les permissions ont bien été sauvegardées côté backend

---

## 📊 Critères de Succès

### ✅ Test RÉUSSI si:
1. Tous les tests de la checklist passent
2. Aucune erreur console
3. Aucune erreur 403/404 inattendue
4. Messagerie JAMAIS accessible aux membres
5. Profil/Paramètres TOUJOURS accessibles
6. Sidebar dynamique fonctionne correctement
7. Dashboard hospitalier intact

### ❌ Test ÉCHOUÉ si:
1. Messagerie visible ou accessible par GESTIONNAIRE/CAISSIER
2. Profil ou Paramètres bloqués pour un membre
3. Membre peut accéder à un module sans permission
4. Dashboard hospitalier modifié ou cassé
5. Erreurs TypeScript ou build échoué
6. Régression sur fonctionnalités existantes

---

## 📝 Rapport de Test

Après avoir effectué tous les tests, remplissez ce rapport:

```
Date du test: ____/____/________
Testeur: _______________________

PHASE 1 - Préparation:           ☐ PASS  ☐ FAIL
PHASE 2 - Permissions:           ☐ PASS  ☐ FAIL
PHASE 3 - Propriétaire:          ☐ PASS  ☐ FAIL
PHASE 4 - Gestionnaire:          ☐ PASS  ☐ FAIL
PHASE 5 - Caissier:              ☐ PASS  ☐ FAIL
PHASE 6 - Modifications:         ☐ PASS  ☐ FAIL
PHASE 7 - Non-régression:        ☐ PASS  ☐ FAIL

Bugs trouvés: _______________________
_____________________________________
_____________________________________

Commentaires: _______________________
_____________________________________
_____________________________________

Résultat global:  ☐ VALIDÉ  ☐ À CORRIGER
```

---

## 🎉 Validation Finale

Une fois TOUS les tests réussis:

1. ✅ Marquer le ticket comme **TERMINÉ**
2. ✅ Déployer en production
3. ✅ Informer l'équipe
4. ✅ Archiver `dynamique.md` comme implémenté

---

**Bonne chance avec les tests ! 🚀**
