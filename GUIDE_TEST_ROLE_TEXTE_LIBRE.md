# Guide de Test - Rôle en Texte Libre

## Vue d'ensemble
Guide pratique pour valider l'implémentation du rôle en texte libre dans SantéProx.

---

## Prérequis

1. **Backend démarré**
   ```bash
   cd backend
   py manage.py runserver
   ```

2. **Frontend démarré**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Compte propriétaire disponible**
   - Email et mot de passe d'un utilisateur avec role PROPRIETAIRE
   - Au moins une structure créée (pharmacie ou hôpital)

---

## Scénarios de Test

### Test 1 : Créer un Membre avec Rôle Personnalisé

#### Étapes
1. Se connecter en tant que **Proprietaire**
2. Aller dans **Mon équipe** (page `/owner/team`)
3. Sélectionner une structure existante
4. Dans le formulaire "Pre-enregistrer un collaborateur" :
   - **Nom complet :** Jean Dupont
   - **Adresse email :** jean.dupont@example.com
   - **Role (optionnel) :** Assistant Pharmacien
5. Cliquer sur **Pre-enregistrer**

#### Résultat Attendu
- ✅ Message de succès affiché
- ✅ Nouveau membre visible dans le tableau "Membres de la structure"
- ✅ Colonne "Role" affiche : "Assistant Pharmacien"
- ✅ Statut : "Invite"
- ✅ Bouton "Activer" disponible

#### Validation Backend
```bash
# Via Django shell
py manage.py shell

from structures.models import EquipeStructure
membre = EquipeStructure.objects.filter(utilisateur__email="jean.dupont@example.com").first()
print(f"Role: {membre.role}")  # "Assistant Pharmacien"
print(f"Statut: {membre.statut}")  # "INVITE"
```

---

### Test 2 : Créer un Membre SANS Rôle

#### Étapes
1. Se connecter en tant que **Proprietaire**
2. Aller dans **Mon équipe**
3. Sélectionner une structure
4. Dans le formulaire "Pre-enregistrer un collaborateur" :
   - **Nom complet :** Marie Martin
   - **Adresse email :** marie.martin@example.com
   - **Role (optionnel) :** (laisser vide)
5. Cliquer sur **Pre-enregistrer**

#### Résultat Attendu
- ✅ Message de succès affiché
- ✅ Nouveau membre visible dans le tableau
- ✅ Colonne "Role" affiche : "-"
- ✅ Statut : "Invite"

#### Validation Backend
```python
membre = EquipeStructure.objects.filter(utilisateur__email="marie.martin@example.com").first()
print(f"Role: {membre.role}")  # None
```

---

### Test 3 : Créer un Membre avec Rôle Legacy

#### Étapes
1. Dans le formulaire d'invitation :
   - **Nom :** Sophie Legrand
   - **Email :** sophie.legrand@example.com
   - **Role :** GESTIONNAIRE
2. Cliquer sur **Pre-enregistrer**

#### Résultat Attendu
- ✅ Membre créé avec succès
- ✅ Colonne "Role" affiche : "GESTIONNAIRE" (texte brut)
- ✅ Pas de comportement spécial (pas de permissions automatiques)

---

### Test 4 : Assigner des Permissions à un Membre avec Rôle Personnalisé

#### Étapes
1. Après avoir créé un membre avec rôle personnalisé (Test 1)
2. Scroller vers "Permissions du membre"
3. Dans le dropdown, sélectionner : **Jean Dupont - Assistant Pharmacien**
4. Cocher quelques permissions :
   - STOCK : CONSULTER, CREER
   - VENTES : CONSULTER
5. Cliquer sur **Enregistrer les permissions**

#### Résultat Attendu
- ✅ Message "Permissions mises à jour."
- ✅ Permissions sauvegardées (recharger la page pour vérifier)
- ✅ Dropdown affiche correctement : "Jean Dupont - Assistant Pharmacien"

#### Validation Backend
```python
from structures.models import MembrePermission

permissions = MembrePermission.objects.filter(
    equipe__utilisateur__email="jean.dupont@example.com"
)
for p in permissions:
    print(f"{p.module}.{p.action}")
# STOCK.CONSULTER
# STOCK.CREER
# VENTES.CONSULTER
```

---

### Test 5 : Assigner des Permissions à un Membre SANS Rôle

#### Étapes
1. Dans "Permissions du membre"
2. Sélectionner : **Marie Martin** (sans suffixe de rôle)
3. Assigner des permissions
4. Cliquer sur **Enregistrer**

#### Résultat Attendu
- ✅ Permissions enregistrées normalement
- ✅ Dropdown affiche : "Marie Martin" (pas de tiret car pas de rôle)
- ✅ Pas de différence fonctionnelle avec un membre ayant un rôle

---

### Test 6 : Activer un Membre avec Rôle Personnalisé

#### Étapes
1. Le membre doit d'abord créer son compte :
   - Aller sur `/inscription`
   - Utiliser l'email pré-enregistré
   - Valider OTP
   - Définir mot de passe
2. En tant que Proprietaire, aller dans **Mon équipe**
3. Trouver le membre (statut ACTIF maintenant)
4. Vérifier le bouton "Desactiver" est disponible
5. Cliquer sur **Desactiver**

#### Résultat Attendu
- ✅ Statut passe à "Suspendu"
- ✅ Bouton change en "Activer"
- ✅ Role toujours affiché ("Assistant Pharmacien" ou "-")

---

### Test 7 : Affichage dans le Tableau des Membres

#### Vérifications Visuelles

| Nom | Email | Role | Attendu |
|-----|-------|------|---------|
| Proprietaire Test | prop@example.com | PROPRIETAIRE | "Proprietaire" |
| Jean Dupont | jean.dupont@example.com | Assistant Pharmacien | "Assistant Pharmacien" |
| Marie Martin | marie.martin@example.com | null | "-" |
| Sophie Legrand | sophie.legrand@example.com | GESTIONNAIRE | "GESTIONNAIRE" |

#### Boutons Actions

| Membre | Action Disponible |
|--------|-------------------|
| Proprietaire | ❌ (aucune action) |
| Assistant Pharmacien | ✅ Activer/Desactiver |
| Sans rôle | ✅ Activer/Desactiver |
| GESTIONNAIRE | ✅ Activer/Desactiver |

---

### Test 8 : Tentative d'Action sur le Proprietaire

#### Étapes (Test API Direct)
```bash
# Obtenir l'ID du membre proprietaire
curl -X GET "http://localhost:8000/api/structures/team/?structure_id={uuid}" \
  -H "Authorization: Bearer {token}"

# Tenter de modifier le statut
curl -X PATCH "http://localhost:8000/api/structures/team/{proprietaire_id}/status/" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action": "DEACTIVATE"}'
```

#### Résultat Attendu
```json
{
  "detail": "Le proprietaire ne peut pas etre modifie."
}
```
Status: 400 Bad Request

---

### Test 9 : Tentative de Permissions pour le Proprietaire

#### Étapes (Test API Direct)
```bash
curl -X GET "http://localhost:8000/api/structures/team/{proprietaire_id}/permissions/" \
  -H "Authorization: Bearer {token}"
```

#### Résultat Attendu
```json
{
  "detail": "Les permissions ne s'appliquent pas au propriétaire."
}
```
Status: 400 Bad Request

---

### Test 10 : Modification de Rôle (Non Supporté Actuellement)

#### Note
L'interface actuelle ne permet pas de modifier le rôle d'un membre existant.
Le rôle est défini uniquement à la création.

#### Workaround (Si Nécessaire)
Via Django Admin ou shell :
```python
membre = EquipeStructure.objects.get(id="uuid-here")
membre.role = "Nouveau Role"
membre.save()
```

---

## Tests de Régression

### Vérifier que l'Ancien Comportement Fonctionne

#### Test R1 : Navigation Pharmacy
1. Se connecter avec un membre opérationnel
2. Vérifier redirection vers `/pharmacy` (pas `/caissier`)

#### Test R2 : Modules Visibles
1. Se connecter avec un membre ayant permissions STOCK
2. Vérifier sidebar affiche module STOCK
3. Vérifier absence des modules non autorisés

#### Test R3 : Permissions Granulaires
1. Assigner STOCK.CONSULTER (sans CREER)
2. Se connecter avec ce membre
3. Vérifier page STOCK accessible
4. Vérifier bouton "Ajouter" absent

---

## Validation des Types TypeScript

### Vérification Frontend
```bash
cd frontend
npm run type-check
# OU
npx tsc --noEmit
```

#### Résultat Attendu
```
✓ No TypeScript errors found
```

---

## Checklist Complète

### Backend
- [ ] Migration appliquée sans erreur
- [ ] `py manage.py check` sans problèmes
- [ ] Création membre avec rôle personnalisé
- [ ] Création membre sans rôle
- [ ] Permissions assignables aux deux types
- [ ] Filtrage propriétaire fonctionne
- [ ] API retourne erreurs appropriées pour propriétaire

### Frontend
- [ ] Build production sans erreurs
- [ ] Input texte libre visible
- [ ] Placeholder informatif affiché
- [ ] Validation formulaire correcte (rôle optionnel)
- [ ] Tableau affiche rôles correctement
- [ ] Dropdown permissions formaté correctement
- [ ] Membres non-propriétaires éditables

### Expérience Utilisateur
- [ ] Message de succès clair
- [ ] Pas de confusion entre rôle et permissions
- [ ] Placeholder guide l'utilisateur
- [ ] Affichage cohérent (Proprietaire vs texte libre vs vide)

---

## Bugs Potentiels à Surveiller

### 1. Rôle Trop Long
**Test :** Entrer un rôle de 150 caractères
**Attendu :** Validation backend rejette (max 100)

### 2. Caractères Spéciaux
**Test :** Rôle avec émojis ou HTML
**Attendu :** Accepté mais échappé à l'affichage

### 3. Espace Vide comme Rôle
**Test :** Entrer "   " (espaces uniquement)
**Attendu :** Converti en null (validation `strip()`)

### 4. Collision PROPRIETAIRE
**Test :** Tenter d'assigner role="PROPRIETAIRE" manuellement
**Attendu :** Accepté MAIS pas de privilèges spéciaux (c'est juste du texte)

---

## Rollback (Si Nécessaire)

### Annuler la Migration
```bash
cd backend
py manage.py migrate structures 0007  # Migration précédente
```

### Restaurer Types Frontend
```bash
cd frontend
git checkout HEAD -- src/features/shared/team/types/team.ts
git checkout HEAD -- src/features/shared/team/pages/TeamPage.tsx
```

### Restaurer Backend
```bash
cd backend
git checkout HEAD -- structures/models.py
git checkout HEAD -- structures/serializers.py
git checkout HEAD -- structures/views.py
git checkout HEAD -- utilisateurs/services/invitation_service.py
```

---

## Support et Debugging

### Logs Backend
```bash
# Activer DEBUG dans .env
DEBUG=True

# Relancer serveur
py manage.py runserver

# Observer logs pour erreurs
```

### Logs Frontend
```javascript
// Dans console navigateur
console.log(member.role);  // null, "Assistant", etc.
```

### Base de Données
```sql
-- Voir tous les rôles actuels
SELECT u.email, es.role, es.statut 
FROM structures_equipestructure es
JOIN utilisateurs_utilisateur u ON u.id = es.utilisateur_id
ORDER BY es.structure_id, es.role;

-- Compter rôles uniques
SELECT role, COUNT(*) 
FROM structures_equipestructure 
WHERE role IS NOT NULL
GROUP BY role;
```

---

## Résultat Attendu Global

Après tous les tests :
- ✅ 0 erreurs backend
- ✅ 0 erreurs frontend
- ✅ Tous les scénarios fonctionnent
- ✅ Permissions indépendantes du rôle texte
- ✅ UX claire et intuitive
- ✅ Compatibilité avec données existantes

**Implémentation validée et prête pour production !**
