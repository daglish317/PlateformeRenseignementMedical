# Workflow Backend - Audit des Fonctionnalités

## Vue d'ensemble

Le backend est structuré en **13 applications Django** avec une architecture REST (DRF) et WebSocket (Channels).

---

## 1. Application `utilisateurs`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `register/` | POST | Inscription d'un patient | Public |
| `login/` | POST | Connexion email/mot de passe | Public |
| `google/` | POST | Authentification via Google OAuth | Public |
| `logout/` | POST | Déconnexion (blacklist refresh token) | Authentifié |
| `me/` | GET | Profil utilisateur courant | Authentifié |
| `me/` | PATCH | Mise à jour du profil | Authentifié |
| `change-password/` | POST | Changement de mot de passe | Authentifié |
| `forgot-password/` | POST | Envoi code OTP par email | Public |
| `reset-password/` | POST | Réinitialisation mot de passe avec code | Public |
| `token/refresh/` | POST | Rafraîchissement du token JWT | Public |
| `admin/invite/` | POST | Invitation d'un gestionnaire | Administrateur |
| `gestionnaire/validate-otp/` | POST | Validation OTP invitation | Public |
| `gestionnaire/set-password/` | POST | Définir mot de passe après invitation | Public |

### Workflow d'authentification

```
Inscription → Login → JWT (access + refresh)
    ↓
Google OAuth → JWT
    ↓
Logout → Blacklist refresh token
```

### Rôles

- **ADMINISTRATEUR** : Gestion des structures, invitations, notifications
- **GESTIONNAIRE** : Gestion d'une structure (stock, services, plateau technique)
- **PATIENT** : Consultation, avis, feedback, messagerie

### Sécurité

- Rate limiting sur le login (10 tentatives / 15 min)
- Blacklist JWT pour la déconnexion

---

## 2. Application `structures`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Création d'une structure | Gestionnaire |
| `admin/list/` | GET | Liste des structures (admin) | Administrateur |
| `admin/validate/<pk>/` | PATCH | Validation/Refus structure | Administrateur |
| `<pk>/` | GET | Détail d'une structure | Public |
| `proches/` | GET | Structures à proximité (geo) | Public |
| `submit/` | POST | Soumission formulaire structure | Public |
| `favoris/` | GET | Liste des favoris utilisateur | Authentifié |
| `favoris/add/` | POST | Ajouter une structure en favori | Authentifié |
| `favoris/<structure_id>/remove/` | DELETE | Retirer des favoris | Authentifié |
| `favoris/<structure_id>/check/` | GET | Vérifier si en favori | Authentifié |
| `<structure_id>/horaires/` | GET | Horaires d'une structure | Public |
| `<structure_id>/horaires/set/` | PUT | Définir les horaires (bulk) | Gestionnaire |
| `horaires/<pk>/` | PATCH | Modifier un horaire | Gestionnaire |

### Workflow

```
Gestionnaire crée structure (statut: EN_ATTENTE)
    ↓
Admin consulte liste
    ↓
Admin valide (ACTIVE) ou refuse (REFUSEE + motif)
```

### Favoris

```
Utilisateur ajoute structure en favori
    ↓
Vérification unicité (user + structure)
    ↓
Liste des favoris (tri par date ajout)
    ↓
Retrait des favoris possible
```

### Horaires

```
Gestionnaire définit les 7 jours d'horaires
    ↓
Validation: ouverture < fermeture, pas de doublons
    ↓
Possibilité de marquer un jour comme fermé
    ↓
Mise à jour individuelle d'un jour
```

### Modèle de données

- Types : HOPITAL, PHARMACIE
- Statuts : EN_ATTENTE, ACTIVE, REFUSEE
- Géolocalisation (latitude, longitude)
- Soft delete (est_supprimee)

### Table Favori

- **utilisateur** : FK vers Utilisateur
- **structure** : FK vers Structure
- **date_ajout** : DateTime auto
- **Contrainte** : unicité (utilisateur + structure)

### Table Horaire

- **structure** : FK vers Structure
- **jour** : LUNDI → DIMANCHE
- **heure_ouverture** : TimeField
- **heure_fermeture** : TimeField
- **est_ferme** : BooleanField (pour les jours fermés)
- **Contrainte** : unicité (structure + jour)

---

## 3. Application `notifications`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `""` | GET | Liste notifications utilisateur | Authentifié |
| `read/<pk>/` | POST | Marquer comme lue | Authentifié |
| `delete/<pk>/` | DELETE | Supprimer une notification | Authentifié |
| `admin/send/` | POST | Envoyer notification à un user | Administrateur |

### Types de notifications

- **SYSTEM** : Notifications système
- **ADMIN** : Notifications administrateur
- **STRUCTURE** : Notifications liées aux structures

### WebSocket

- Consumer `NotificationConsumer` pour push temps réel
- Authentification via token JWT dans query string

### Nettoyage automatique

- Les notifications lues depuis plus de 30 jours sont supprimées automatiquement

---

## 4. Application `stock`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Ajouter item au stock | Gestionnaire |
| `structure/<id>/` | GET | Liste stock d'une structure | Public |
| `<pk>/delete/` | DELETE | Supprimer un item | Gestionnaire |
| `<pk>/retirer/` | POST | Retirer du stock | Gestionnaire |
| `<pk>/entree/` | POST | Entrée de stock | Gestionnaire |
| `<pk>/mouvements/` | GET | Historique mouvements | Gestionnaire |
| `structure/<id>/alertes/` | GET | Items en alerte | Gestionnaire |

### Workflow

```
Gestionnaire crée item (nom, type, quantité, seuil_alerte)
    ↓
Entrées / Sorties avec motif
    ↓
Suivi des mouvements
    ↓
Alertes si quantité < seuil
    ↓
Suppression possible
```

### Types d'items

- MEDICAMENT, EQUIPEMENT, CONSOMMABLE

---

## 5. Application `messagerie`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `conversations/` | GET | Liste des conversations utilisateur | Gestionnaire/Admin |
| `unread-count/` | GET | Compteur total de non-lus | Gestionnaire/Admin |
| `conversation/<structure_id>/` | GET | Obtenir/créer conversation | Gestionnaire/Admin |
| `send/<conversation_id>/` | POST | Envoyer message | Gestionnaire/Admin |
| `read/<pk>/` | PATCH | Marquer message lu | Gestionnaire/Admin |
| `delete/<pk>/` | DELETE | Supprimer un message (soft delete) | Gestionnaire/Admin |

### Contrainte d'accès

La messagerie est **exclusivement réservée** aux rôles :
- **ADMINISTRATEUR** : peut accéder à toutes les conversations
- **GESTIONNAIRE** : ne peut accéder qu'à la conversation de sa structure

Les patients **ne peuvent pas** utiliser la messagerie.

### WebSocket

- Consumer `ChatConsumer` pour messagerie temps réel
- Authentification JWT
- Broadcast dans la room de conversation

### Workflow

```
Gestionnaire/Admin accède conversation (par structure)
    ↓
Messages paginés (page, page_size)
    ↓
Marquage automatique des messages comme lus à l'ouverture
    ↓
Envoi de messages via API ou WebSocket
    ↓
Suppression soft (contenu remplacé par "Message supprimé")
```

### Fonctionnalités détaillées

**Liste des conversations :**
- Retourne toutes les conversations de l'utilisateur
- Inclut le dernier message de chaque conversation
- Nombre de messages non lus par conversation
- Tri par date de dernière activité

**Compteur de non-lus :**
- Nombre total de messages non lus toutes conversations confondues
- Endpoint dédié pour le badge de notification

**Suppression de messages :**
- Soft delete : le message est marqué comme supprimé
- Seul l'expéditeur peut supprimer son propre message
- Le contenu est remplacé par "Message supprimé"
- L'admin peut supprimer n'importe quel message dans ses conversations

---

## 6. Application `feedback`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Créer un feedback (structure ou plateforme) | Patient |
| `<pk>/update/` | PATCH | Modifier feedback | Patient (propriétaire) |
| `admin/list/` | GET | Liste tous les feedbacks | Administrateur |
| `admin/structure/<id>/` | GET | Feedbacks d'une structure | Administrateur |
| `admin/stats/` | GET | Statistiques feedbacks | Administrateur |
| `admin/<pk>/delete/` | DELETE | Supprimer un feedback | Administrateur |

### Types de feedback

- **STRUCTURE** : Avis sur une structure (note + commentaire)
- **PLATEFORME** : Avis sur la plateforme (note + commentaire)

### Règles d'accès

- **Création** : Patient authentifié uniquement
- **Modification** : Patient propriétaire du feedback uniquement
- **Consultation** : Administrateur uniquement
- **Suppression** : Administrateur uniquement

---

## 7. Application `avis`

### Statut : DÉSACTIVÉE

> **ATTENTION** : Cette application est désactivée et ne retourne que des erreurs 404.
> Utilisez l'application `feedback` pour donner votre avis.

Tous les endpoints retournent :
```json
{
  "detail": "Ce module est désactivé. Utilisez l'application feedback."
}
```

### Endpoints (tous désactivés)

| Endpoint | Méthode | Description | Statut |
|----------|---------|-------------|--------|
| `create/` | POST | Créer un avis | 404 |
| `<pk>/update/` | PATCH | Modifier avis | 404 |
| `<pk>/delete/` | DELETE | Supprimer avis | 404 |
| `structure/<id>/` | GET | Avis d'une structure | 404 |
| `comment/add/` | POST | Ajouter commentaire | 404 |
| `comment/<pk>/update/` | PATCH | Modifier commentaire | 404 |
| `comment/<pk>/delete/` | DELETE | Supprimer commentaire | 404 |

### Raison

Cette application a été délibérément déconnectée du reste du projet. L'application `feedback` est la seule autorisée pour les avis utilisateurs.

---

## 8. Application `catalogues`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `""` | GET | Liste catalogues (avec filtres) | Public |
| `<pk>/` | GET | Détail catalogue | Public |
| `create/` | POST | Créer catalogue | Administrateur |
| `update/<pk>/` | PUT | Modifier catalogue | Administrateur |
| `delete/<pk>/` | DELETE | Supprimer catalogue | Administrateur |
| `activate/<pk>/` | PATCH | Activer catalogue | Administrateur |
| `deactivate/<pk>/` | PATCH | Désactiver catalogue | Administrateur |

### Types de catalogues

- MALADIE, ANALYSE, EXAMEN, SERVICE_MEDICAL

### Fonctionnalités spéciales

- Recherche floue (fuzzy search) via paramètre `fuzzy=true`
- Filtrage par type et nom

---

## 9. Application `service_medical`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Ajouter service médical à structure | Gestionnaire |
| `structure/<id>/` | GET | Services d'une structure | Public |
| `admin/list/` | GET | Liste tous les services | Administrateur |
| `<pk>/deactivate/` | PATCH | Désactiver service | Gestionnaire |

### Workflow

```
Gestionnaire lie un catalogue à sa structure
    ↓
Service actif par défaut
    ↓
Gestionnaire peut désactiver
```

---

## 10. Application `plateau_technique`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Ajouter équipement | Gestionnaire |
| `structure/<id>/` | GET | Équipements d'une structure | Public |
| `admin/list/` | GET | Liste tous les équipements | Administrateur |
| `<pk>/deactivate/` | PATCH | Rendre indisponible | Gestionnaire |

### Workflow

```
Gestionnaire lie un catalogue (équipement) à sa structure
    ↓
Équipement disponible par défaut
    ↓
Gestionnaire peut rendre indisponible
```

---

## 11. Application `prise_en_charge`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `create/` | POST | Ajouter prise en charge | Gestionnaire |
| `<pk>/update/` | PATCH | Modifier niveau prise en charge | Gestionnaire |
| `<pk>/delete/` | DELETE | Supprimer prise en charge | Gestionnaire |
| `structure/<id>/` | GET | Prises en charge d'une structure | Public |
| `admin/list/` | GET | Liste toutes les prises en charge | Administrateur |

### Niveaux

- COMPLET, PARTIEL, ORIENTATION

---

## 12. Application `search`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `""` | GET | Recherche multi-critères | Public |
| `suggestions/` | GET | Suggestions de recherche | Public |

### Paramètres de recherche

- `q` : requête de recherche
- `lat`, `lon` : position utilisateur (pour tri par distance)
- `page`, `page_size` : pagination

### Points d'amélioration

- **ARCHITECTURE COMPLEXE** : Dossiers `engines/`, `ranking/`, `suggestions/`, `services/`, `utils/` mais peu de visibilité sur le contenu

---

## 13. Application `core`

### Fonctionnalités implémentées

| Endpoint | Méthode | Description | Rôle requis |
|----------|---------|-------------|-------------|
| `verification/...` | - | Service de vérification OTP | - |
| `import/catalogue/` | POST | Import CSV/Excel de catalogues | Administrateur |

### Sous-modules

- **verification/** : Génération et validation de codes OTP
- **imports/** : Import de données (CSV, Excel) avec validation
- **email/** : Service d'envoi d'emails
- **notifications/** : Utilitaires de notification
- **events/** : Gestion d'événements
- **utils/** : Utilitaires divers (rate limiting, etc.)

---

## Résumé des problèmes identifiés

| Application | Problème | Priorité |
|-------------|----------|----------|
| `stock` | Pas de notification automatique d'alertes | Haute |

---

## Architecture technique

- **Framework** : Django + Django REST Framework
- **Auth** : JWT (SimpleJWT) + Google OAuth
- **WebSocket** : Django Channels
- **Base de données** : PostgreSQL (recommandé)
- **Géolocalisation** : Calcul de distance entre coordonnées
- **Recherche** : Système de recherche avec suggestions floues
- **Import** : Support CSV/Excel avec validation
