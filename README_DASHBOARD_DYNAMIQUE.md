# Dashboard Pharmacie Dynamique - Documentation Complète

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Utilisation](#utilisation)
7. [API Backend](#api-backend)
8. [Dépannage](#dépannage)
9. [Références](#références)

---

## 📖 Vue d'ensemble

Le système de **Dashboard Dynamique** transforme la gestion des pharmacies en permettant au propriétaire de définir précisément quels modules opérationnels chaque membre de son équipe peut utiliser.

### Avant ❌
- Dashboard GESTIONNAIRE avec modules fixes
- Dashboard CAISSIER avec modules fixes
- Pas de flexibilité
- Rôles rigides

### Après ✅
- **Un seul dashboard équipe** `/pharmacy`
- **Permissions granulaires** par module et par action
- **Flexibilité totale** pour le propriétaire
- **Sécurité renforcée** avec vérification backend

---

## 🏗️ Architecture

### Hiérarchie

```
┌─────────────────────────────────────┐
│      PROPRIÉTAIRE PHARMACIE         │
│   Dashboard: /owner                 │
│   - Tous les modules                │
│   - Messagerie exclusive            │
│   - Gestion équipe & permissions    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   GESTIONNAIRE     CAISSIER
       │                │
       └───────┬────────┘
               │
      ┌────────▼─────────┐
      │  Dashboard équipe │
      │   /pharmacy       │
      │  (Dynamique)      │
      └──────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
Sidebar    Modules    Actions
(filtrée)  (autorisés) (permises)
```

### Types d'Utilisateurs

| Rôle | Dashboard | Permissions | Gestion Équipe |
|------|-----------|-------------|----------------|
| **PROPRIETAIRE** | `/owner` | Toutes | ✅ Oui |
| **GESTIONNAIRE** | `/pharmacy` | Définies par propriétaire | ❌ Non |
| **CAISSIER** | `/pharmacy` | Définies par propriétaire | ❌ Non |

---

## ⚙️ Fonctionnalités

### 1. Gestion des Permissions

Le propriétaire peut depuis `/owner/team`:

#### Créer des Structures
- Nom, type (PHARMACIE/HOPITAL), adresse, téléphone
- Gestion multi-structures

#### Inviter des Membres
- Rôle: GESTIONNAIRE ou CAISSIER
- Pré-enregistrement (pas d'email automatique)
- Activation au moment de l'inscription

#### Définir les Permissions
- **Sélection de structure**
- **Sélection de membre**
- **Configuration par module**:
  - Opérations métier (STOCK, VENTE, CAISSE, etc.)
  - Suivi et contrôle (INVENTAIRE, HISTORIQUE, STATISTIQUES, etc.)
  - Gestion et accès (HORAIRES, NOTIFICATIONS, PROFIL, PARAMETRES)

- **Actions par module**:
  - CONSULTER
  - CREER
  - MODIFIER
  - SUPPRIMER
  - EXPORTER
  - IMPRIMER
  - FILTRER
  - RECHERCHER
  - ANNULER
  - VALIDER_PAIEMENT
  - REFUSER_PAIEMENT
  - IMPRIMER_RECU
  - RETOUR_CAISSE

### 2. Modules Disponibles

#### Modules Conditionnels
Nécessitent une permission explicite:
- **APPROVISIONNEMENT** - Gestion des commandes fournisseurs
- **STOCK** - Inventaire des produits
- **VENTE** - Préparation des ventes
- **CAISSE** - Encaissement et transactions
- **INVENTAIRE** - États du stock
- **ALERTES** - Notifications stock faible
- **PEREMPTION** - Suivi dates de péremption
- **HISTORIQUE** - Traçabilité des opérations
- **STATISTIQUES** - Rapports et analyses
- **HORAIRES** - Gestion des horaires d'ouverture
- **NOTIFICATIONS** - Alertes système

#### Modules Obligatoires
Toujours accessibles (ne nécessitent pas de permission):
- **PROFIL** - Informations personnelles
- **PARAMETRES** - Configuration du compte

#### Module Exclusif Propriétaire
Jamais accessible aux membres d'équipe:
- **MESSAGERIE** - Communication propriétaire/admin

### 3. Dashboard Dynamique

#### Sidebar Intelligente
- **Filtre automatique** selon permissions
- **Masquage** des modules non autorisés
- **Profil/Paramètres** toujours visibles
- **Messagerie** jamais visible aux membres

#### Protection des Routes
- Vérification des permissions à l'accès
- Redirection automatique si non autorisé
- Accès direct URL bloqué
- Message clair si permission manquante

#### Expérience Utilisateur
- Interface claire et intuitive
- Feedback visuel immédiat
- Pas de confusion sur les droits
- Navigation fluide

---

## 🚀 Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis (optionnel, pour le cache)

### Backend (Django)

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend (Next.js)

```bash
cd frontend

# Installer les dépendances
npm install

# Compiler (production)
npm run build

# Démarrer (production)
npm start

# Ou développement
npm run dev
```

---

## ⚙️ Configuration

### Variables d'Environnement Backend

```env
# backend/.env
SECRET_KEY=votre-clé-secrète
DEBUG=False
DATABASE_URL=postgresql://user:password@localhost:5432/santeprox
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://votre-domaine.com

# JWT
JWT_SECRET_KEY=votre-jwt-secret
```

### Variables d'Environnement Frontend

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Configuration Permissions Backend

Le registre des permissions est défini dans:
```
backend/structures/permission_registry.py
```

Pour ajouter un nouveau module:

```python
class ModuleOperationnel(models.TextChoices):
    # ... modules existants ...
    NOUVEAU_MODULE = "NOUVEAU_MODULE", "Nouveau Module"

MODULE_ACTIONS = {
    # ... actions existantes ...
    ModuleOperationnel.NOUVEAU_MODULE: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        # ... autres actions ...
    ],
}
```

---

## 💻 Utilisation

### Pour le Propriétaire

#### 1. Créer une Structure
```
1. Se connecter en tant que PROPRIETAIRE
2. Naviguer vers /owner/team
3. Remplir le formulaire "Créer une structure"
4. Cliquer sur "Créer"
```

#### 2. Inviter un Membre
```
1. Sélectionner la structure
2. Remplir le formulaire "Pré-enregistrer un collaborateur"
3. Choisir le rôle (GESTIONNAIRE ou CAISSIER)
4. Cliquer sur "Pré-enregistrer"
```

#### 3. Configurer les Permissions
```
1. Dans "Permissions du membre", sélectionner le membre
2. Cocher les modules autorisés
3. Pour chaque module, cocher les actions autorisées
4. Cliquer sur "Enregistrer"
```

#### 4. Modifier les Permissions
```
1. Sélectionner le membre
2. Modifier les cases à cocher
3. Cliquer sur "Enregistrer"
4. Les changements sont immédiats
```

### Pour le Gestionnaire / Caissier

#### 1. S'inscrire
```
1. Aller sur /inscription
2. Utiliser l'email pré-enregistré
3. Compléter le profil
4. Validation automatique si email correspond
```

#### 2. Accéder au Dashboard
```
1. Se connecter
2. Redirection automatique vers /pharmacy
3. Sidebar affiche uniquement les modules autorisés
```

#### 3. Utiliser les Modules
```
1. Cliquer sur un module dans la sidebar
2. Utiliser les fonctionnalités selon les actions autorisées
3. Profil et Paramètres toujours accessibles
```

---

## 🔌 API Backend

### Endpoints Permissions

#### Récupérer le Registre
```http
GET /api/structures/permissions/registry/
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "modules": {
    "STOCK": ["CONSULTER", "MODIFIER", "SUPPRIMER"],
    "VENTE": ["CONSULTER", "CREER", "MODIFIER"],
    // ... autres modules ...
  }
}
```

#### Récupérer les Permissions d'un Membre
```http
GET /api/structures/team/{memberId}/permissions/
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "member": {
    "id": "uuid",
    "nom": "Jean Dupont",
    "email": "jean@exemple.com",
    "role": "GESTIONNAIRE"
  },
  "structure_id": "uuid",
  "permissions": {
    "STOCK": ["CONSULTER", "MODIFIER"],
    "VENTE": ["CONSULTER", "CREER"]
  },
  "registry": {
    // ... registre complet ...
  }
}
```

#### Mettre à Jour les Permissions
```http
PUT /api/structures/team/{memberId}/permissions/
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": {
    "STOCK": ["CONSULTER", "MODIFIER", "EXPORTER"],
    "VENTE": ["CONSULTER", "CREER"]
  }
}
```

**Réponse:**
```json
{
  "message": "Permissions mises à jour",
  "member": { ... },
  "structure_id": "uuid",
  "permissions": { ... },
  "registry": { ... }
}
```

#### Récupérer Mes Permissions
```http
GET /api/structures/me/permissions/
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "structure_id": "uuid",
  "full_access": false,
  "modules": {
    "STOCK": ["CONSULTER"],
    "VENTE": ["CONSULTER", "CREER"]
  }
}
```

### Endpoints Équipe

#### Lister l'Équipe
```http
GET /api/structures/team/?structure_id={structureId}
Authorization: Bearer {token}
```

#### Inviter un Membre
```http
POST /api/structures/team/
Authorization: Bearer {token}
Content-Type: application/json

{
  "structure_id": "uuid",
  "nom": "Jean Dupont",
  "email": "jean@exemple.com",
  "role": "GESTIONNAIRE"
}
```

#### Modifier le Statut
```http
PATCH /api/structures/team/{memberId}/status/
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "ACTIVATE"  // ou "DEACTIVATE"
}
```

---

## 🐛 Dépannage

### Problème: Permissions ne se chargent pas

**Symptômes:**
- Interface de permissions vide
- Erreur 403 ou 500

**Solutions:**
1. Vérifier que l'utilisateur est **ACTIF**
2. Vérifier la connexion backend (DevTools → Network)
3. Consulter les logs Django:
   ```bash
   python manage.py runserver
   # Observer les logs
   ```
4. Vérifier les permissions backend:
   ```bash
   python manage.py shell
   >>> from structures.models import EquipeStructure
   >>> EquipeStructure.objects.filter(email="gestionnaire@test.com")
   ```

### Problème: Sidebar vide après connexion

**Symptômes:**
- Sidebar ne montre que Dashboard, Profil, Paramètres
- Aucun module métier visible

**Solutions:**
1. Vérifier que des permissions ont été attribuées
2. Rafraîchir la page (F5)
3. Vider le cache navigateur (Ctrl+Shift+Del)
4. Vérifier dans `/owner/team` que les permissions sont bien enregistrées

### Problème: Messagerie visible pour un membre

**Symptômes:**
- Messagerie apparaît dans la sidebar GESTIONNAIRE ou CAISSIER
- Accès possible à `/pharmacy/chat`

**Solutions:**
⚠️ **BUG CRITIQUE** - Ne devrait JAMAIS arriver

1. Vérifier `frontend/src/features/shared/dashboard/navigation/pharmacy-navigation.ts`
   - Messagerie ne doit PAS être présente
2. Vérifier `frontend/src/features/shared/dashboard/constants/route-permissions.ts`
   - `/pharmacy/chat` doit avoir `{ blocked: true }`
3. Recompiler le frontend:
   ```bash
   npm run build
   ```

### Problème: Module accessible sans permission

**Symptômes:**
- URL directe fonctionne malgré absence de permission
- Pas de redirection

**Solutions:**
1. Vérifier `DashboardRoute.tsx` pour la protection de route
2. Vérifier `route-permissions.ts` pour la configuration de la route
3. Vérifier les logs backend pour la vérification de permission
4. Tester dans une fenêtre de navigation privée

### Problème: Modifications de permissions non visibles

**Symptômes:**
- Permissions modifiées côté propriétaire
- Pas de changement côté membre

**Solutions:**
1. Le membre doit **se déconnecter et se reconnecter**
2. Ou rafraîchir la page (F5)
3. Vérifier que l'enregistrement a réussi (message de succès)
4. Vérifier dans la base de données:
   ```sql
   SELECT * FROM structures_membrepermission WHERE membre_id = 'uuid';
   ```

---

## 📚 Références

### Documents du Projet

| Document | Description | Localisation |
|----------|-------------|--------------|
| **dynamique.md** | Spécification fonctionnelle complète | Racine du projet |
| **IMPLEMENTATION_DASHBOARD_DYNAMIQUE.md** | Documentation technique de l'implémentation | Racine du projet |
| **GUIDE_TEST_DASHBOARD_DYNAMIQUE.md** | Guide de test complet | Racine du projet |
| **README_DASHBOARD_DYNAMIQUE.md** | Ce document | Racine du projet |

### Fichiers Clés Frontend

```
frontend/src/
├── features/shared/dashboard/
│   ├── navigation/
│   │   ├── owner-navigation.ts          # Navigation propriétaire
│   │   └── pharmacy-navigation.ts       # Navigation équipe
│   ├── constants/
│   │   └── route-permissions.ts         # Protection des routes
│   ├── types/
│   │   └── permissions.ts               # Types TypeScript
│   ├── layout/
│   │   ├── DashboardRoute.tsx           # Composant de protection
│   │   └── DashboardSidebar.tsx         # Sidebar dynamique
│   └── hooks/
│       ├── useDashboardNavigation.ts    # Hook navigation
│       └── useMyPermissions.ts          # Hook permissions
└── features/shared/team/
    ├── components/
    │   └── MemberPermissionsEditor.tsx  # Éditeur de permissions
    ├── hooks/
    │   ├── useMemberPermissions.ts      # Récupération permissions
    │   └── useUpdateTeamPermissions.ts  # Mise à jour permissions
    └── api/
        └── team.service.ts              # Appels API équipe
```

### Fichiers Clés Backend

```
backend/
├── structures/
│   ├── permission_registry.py          # Registre des modules
│   ├── permission_service.py           # Logique permissions
│   ├── permissions.py                  # Vérifications permissions
│   ├── models.py                       # Modèles BDD
│   ├── views.py                        # API endpoints
│   └── urls.py                         # Routes API
└── utilisateurs/
    ├── models.py                       # Modèle Utilisateur
    └── decorators.py                   # Décorateurs permissions
```

### Technologies Utilisées

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | Next.js | 16.3.0 |
| Frontend | React | 19+ |
| Frontend | TypeScript | 5+ |
| Frontend | TanStack Query | 5+ |
| Backend | Django | 5+ |
| Backend | Django REST Framework | 3+ |
| Base de données | PostgreSQL | 14+ |
| Cache | Redis | 7+ (optionnel) |

### Ressources Externes

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Django REST Framework](https://www.django-rest-framework.org/)
- [Documentation TanStack Query](https://tanstack.com/query/latest)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)

---

## 🤝 Support

Pour toute question ou problème:

1. **Consulter ce document** et les autres documentations
2. **Vérifier les logs** (backend et frontend DevTools)
3. **Tester en environnement de développement** avant production
4. **Contacter l'équipe technique** si problème persistant

---

## 📝 Notes Importantes

### ⚠️ Règles Critiques

1. **MESSAGERIE** est EXCLUSIVEMENT pour le propriétaire
   - Ne JAMAIS l'ajouter au registre des permissions
   - Ne JAMAIS l'afficher dans pharmacy-navigation
   - Route `/pharmacy/chat` TOUJOURS bloquée

2. **PROFIL** et **PARAMETRES** sont TOUJOURS accessibles
   - Ne PAS les conditionner par permissions
   - Ne PAS les mettre dans le registre comme modules attribuables
   - Toujours visibles dans la sidebar équipe

3. **Dashboard hospitalier** ne doit PAS être modifié
   - Toute modification doit être isolée aux pharmacies
   - Tester la non-régression après chaque changement

4. **Sécurité d'abord**
   - Vérification des permissions côté backend OBLIGATOIRE
   - Ne JAMAIS se fier uniquement à la sidebar frontend
   - Protection de routes côté frontend ET backend

### 🎯 Bonnes Pratiques

1. **Tester localement** avant tout déploiement
2. **Sauvegarder la base** avant mise à jour production
3. **Documenter** toute modification des permissions
4. **Communiquer** avec l'équipe avant changement majeur
5. **Monitorer** les logs après déploiement

---

## 📅 Historique des Versions

| Version | Date | Description |
|---------|------|-------------|
| **1.0.0** | 15/08/2026 | Implémentation initiale complète |
| | | - Dashboard unifié /pharmacy |
| | | - Système de permissions dynamiques |
| | | - Messagerie exclusif propriétaire |
| | | - Build frontend réussi |

---

## ✅ Checklist Déploiement Production

Avant de déployer en production, vérifier:

- [ ] Tests complets effectués (GUIDE_TEST_DASHBOARD_DYNAMIQUE.md)
- [ ] Build frontend réussi sans erreurs
- [ ] Migrations backend appliquées
- [ ] Variables d'environnement configurées
- [ ] Base de données sauvegardée
- [ ] CORS configuré correctement
- [ ] JWT secrets définis
- [ ] Messagerie testée (exclusivité propriétaire)
- [ ] Profil/Paramètres testés (accès permanent)
- [ ] Dashboard hospitalier testé (non-régression)
- [ ] Monitoring configuré
- [ ] Logs activés
- [ ] Documentation à jour
- [ ] Équipe informée

---

**Documentation complète - Système de Dashboard Pharmacie Dynamique**  
**Version 1.0.0 - 15 août 2026**  
**SantéProx - Plateforme de Renseignement Médical**
