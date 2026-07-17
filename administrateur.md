BLOC 1 — Architecture générale du Dashboard Administrateur
Objectif

Créer le socle complet du Dashboard Administrateur.

Ce bloc ne contient aucune fonctionnalité métier (gestion des structures, utilisateurs, etc.).

Son unique responsabilité est d'offrir une architecture stable sur laquelle tous les autres modules viendront s'intégrer.

Architecture générale

Créer :

src/app/[locale]/admin/

Structure :

src/app/[locale]/admin/

layout.tsx

page.tsx

loading.tsx

error.tsx

not-found.tsx

Responsabilités :

layout.tsx : layout général du dashboard.
page.tsx : tableau de bord (widgets).
loading.tsx : écran de chargement.
error.tsx : gestion des erreurs.
not-found.tsx : page 404 interne.
Créer la feature Admin

Créer :

src/features/admin/

Organisation :

src/features/admin/

dashboard/

structures/

managers/

users/

catalog/

map/

statistics/

feedback/

chat/

notifications/

settings/

shared/

Chaque module sera totalement indépendant.

Créer les composants communs

Créer :

src/features/admin/shared/components/

Contenu :

AdminSidebar.tsx

AdminHeader.tsx

AdminBreadcrumb.tsx

AdminContent.tsx

AdminPageTitle.tsx

AdminSection.tsx

AdminEmptyState.tsx

AdminLoading.tsx

AdminError.tsx

Responsabilités :

AdminSidebar

Navigation principale.

Aucune logique métier.

AdminHeader

Barre supérieure.

Elle contiendra uniquement :

recherche globale (future extension) ;
notifications ;
avatar administrateur.
AdminBreadcrumb

Affiche la navigation.

Exemple :

Dashboard

>

Structures

>

Validation
AdminContent

Simple conteneur.

Il affiche le contenu du module actif.

AdminPageTitle

Titre de la page.

Sous-titre.

Actions éventuelles.

AdminSection

Conteneur uniforme pour toutes les cartes.

AdminEmptyState

Aucun résultat.

AdminLoading

Chargement uniforme.

AdminError

Affichage uniforme des erreurs.

Créer le Layout Admin

Créer :

src/features/admin/layout/

Contenu :

AdminLayout.tsx

AdminShell.tsx
AdminLayout

Responsable de :

Sidebar
Header
Breadcrumb
Content

Uniquement.

AdminShell

Responsable de :

responsive
largeur
hauteur
scroll
disposition générale
Sidebar

Créer :

src/features/admin/shared/navigation/

Contenu :

navigation.ts

icons.ts

permissions.ts
navigation.ts

Déclare les menus.

Exemple :

Dashboard

Structures

Gestionnaires

Utilisateurs

Catalogue

Carte

Statistiques

Feedback

Messagerie

Notifications

Paramètres
icons.ts

Centralise les icônes Lucide.

permissions.ts

Prépare les permissions.

Aujourd'hui :

ADMIN

Demain :

plusieurs rôles administratifs si besoin.

Header

Créer :

src/features/admin/header/

Contenu :

HeaderNotifications.tsx

HeaderProfile.tsx

HeaderSearch.tsx

Aujourd'hui seul le design est préparé.

Les fonctionnalités arriveront dans les autres blocs.

Types communs

Créer :

src/features/admin/shared/types/

Contenu :

navigation.ts

layout.ts

common.ts
Hooks communs

Créer :

src/features/admin/shared/hooks/

Contenu :

useSidebar.ts

useBreadcrumb.ts

Ils ne gèrent que l'état de l'interface.

Styles

Créer :

src/features/admin/shared/constants/

Contenu :

layout.ts

sidebar.ts

header.ts

Toutes les dimensions seront centralisées.

Exemple :

Sidebar

Largeur

Header

Hauteur

Breakpoints

Espacements
Responsive

Le dashboard doit être pensé dès maintenant pour trois tailles :

Desktop

Sidebar ouverte

Tablet

Sidebar repliable

Mobile

Drawer latéral

Aucune duplication de composants.

Scroll

Le scroll doit être isolé.

On ne veut jamais :

body

qui défile.

Uniquement :

AdminContent
Fichiers existants à modifier

Créer un layout totalement indépendant.

Ne pas réutiliser :

src/components/layout/PublicLayout.tsx

Créer :

src/features/admin/layout/AdminLayout.tsx

Puis :

src/app/[locale]/admin/layout.tsx

utilisera exclusivement ce layout.

Ainsi :

la partie publique ;
le dashboard administrateur ;
le dashboard pharmacie ;
le dashboard hôpital

auront chacun leur propre layout.

Résultat attendu du Bloc 1

À la fin de ce bloc, l'administrateur dispose d'un shell complet comprenant :

un layout dédié et indépendant de la partie publique ;
une sidebar responsive avec la structure complète des modules ;
un header prêt à accueillir les notifications, la recherche globale et le profil ;
un système de navigation centralisé ;
un breadcrumb ;
une zone de contenu avec un scroll indépendant ;
des composants communs réutilisables (chargement, erreurs, états vides, sections, titres) ;
une architecture modulaire (features/admin/...) prête à recevoir les fonctionnalités métier des blocs suivants.

Ce socle servira ensuite à intégrer progressivement les modules de gestion des structures, des utilisateurs, de la cartographie, de la messagerie, des statistiques et des paramètres, sans avoir à modifier l'architecture principale du dashboard.
BLOC 2 — Tableau de bord Administrateur
Objectif

Créer la page d'accueil du Dashboard Administrateur avec une vue synthétique de la plateforme.

Dossiers à créer
src/features/admin/dashboard/
├── api/
├── components/
├── hooks/
├── types/
└── pages/
Fichiers à créer
features/admin/dashboard/pages/DashboardPage.tsx

features/admin/dashboard/hooks/useDashboard.ts

features/admin/dashboard/api/dashboard.service.ts

features/admin/dashboard/types/dashboard.ts

features/admin/dashboard/components/StatsCards.tsx
features/admin/dashboard/components/StatsCard.tsx
features/admin/dashboard/components/PlatformMap.tsx
features/admin/dashboard/components/RecentActivity.tsx
features/admin/dashboard/components/PendingStructures.tsx
features/admin/dashboard/components/DashboardCharts.tsx
Fichiers à modifier
src/app/[locale]/admin/page.tsx

Chargera uniquement :

<DashboardPage />
Layout de la page
DashboardPage

├── StatsCards
├── PlatformMap
├── DashboardCharts
├── PendingStructures
└── RecentActivity
StatsCards

Afficher :

Structures enregistrées
Hôpitaux
Pharmacies
Structures en attente
Gestionnaires
Utilisateurs publics
Feedback non lus
Messages non lus
PlatformMap

Afficher toutes les structures enregistrées.

Fonctionnalités :

marqueurs Hôpital
marqueurs Pharmacie
clic sur un marqueur
résumé rapide
bouton "Voir la structure"

Aucune édition.

DashboardCharts

Afficher :

inscriptions par mois
validations
recherches effectuées
répartition Hôpital / Pharmacie

Prévoir uniquement les composants.

PendingStructures

Afficher :

photo
nom
type
date
bouton "Examiner"

Maximum :

10 structures
RecentActivity

Afficher :

nouvelles structures
validations
refus
nouveaux utilisateurs
nouveaux feedbacks

Ordre :

plus récent → plus ancien.

Hook
useDashboard.ts

Responsabilité :

Récupérer toutes les données du dashboard.

Aucune logique d'affichage.

Service
dashboard.service.ts

Responsabilité :

Toutes les requêtes API.

Type
dashboard.ts

Centraliser tous les types.

Résultat attendu

Le Dashboard Administrateur affiche :

KPI principaux
Carte de supervision
Graphiques
Structures en attente
Activité récente

Aucune gestion métier n'est réalisée depuis cette page, uniquement une vue d'ensemble.
BLOC 3 — Gestion des Structures
Objectif

Permettre à l'administrateur de gérer toutes les structures médicales de la plateforme.

Dossiers à créer
src/features/admin/structures/

├── api/
├── hooks/
├── types/
├── validation/
├── store/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/structures/pages/StructuresPage.tsx

features/admin/structures/api/structures.service.ts

features/admin/structures/hooks/useStructures.ts
features/admin/structures/hooks/useStructure.ts
features/admin/structures/hooks/useValidateStructure.ts
features/admin/structures/hooks/useRejectStructure.ts

features/admin/structures/store/structures-store.ts

features/admin/structures/types/structure.ts

features/admin/structures/components/StructureTable.tsx
features/admin/structures/components/StructureFilters.tsx
features/admin/structures/components/StructureSearch.tsx
features/admin/structures/components/StructureCard.tsx
features/admin/structures/components/StructureDetails.tsx
features/admin/structures/components/StructureStatusBadge.tsx
features/admin/structures/components/StructurePhoto.tsx
features/admin/structures/components/ValidateDialog.tsx
features/admin/structures/components/RejectDialog.tsx
features/admin/structures/components/StructureActions.tsx
features/admin/structures/components/EmptyStructures.tsx
Fichiers à modifier
src/app/[locale]/admin/structures/page.tsx

Charge uniquement :

<StructuresPage />
Layout
StructuresPage

├── StructureSearch
├── StructureFilters
├── StructureTable
│
└── StructureDetails
StructureSearch

Fonction :

recherche par nom
recherche instantanée
StructureFilters

Filtres :

Toutes
En attente
Validées
Refusées
Hôpitaux
Pharmacies

Combinaison des filtres autorisée.

StructureTable

Colonnes :

Photo
Nom
Type
Adresse
Téléphone
Gestionnaire
Statut
Date création
Actions
StructureDetails

Afficher :

informations générales
localisation
horaires
photo
gestionnaire
informations de validation

Lecture seule.

StructureActions

Actions disponibles :

Voir
Valider
Refuser
ValidateDialog

Confirmer la validation.

RejectDialog

Saisir obligatoirement :

motif du refus

Impossible de valider sans motif.

StructureStatusBadge

Afficher :

En attente
Validée
Refusée

Couleur selon le statut.

StructurePhoto

Afficher :

photo réelle
image par défaut si absente
Hooks
useStructures.ts

Responsabilité :

liste
pagination
recherche
filtres
useStructure.ts

Responsabilité :

charger une structure.

useValidateStructure.ts

Responsabilité :

validation.

useRejectStructure.ts

Responsabilité :

refus.

Store
structures-store.ts

Contient uniquement :

selectedStructure

filters

search

page

pageSize
Service
structures.service.ts

Responsable de tous les appels API.

Types

Centraliser :

Structure
Statut
Filtres
Pagination
Fonctionnalités

✓ Recherche instantanée

✓ Pagination

✓ Tri

✓ Filtres

✓ Consultation

✓ Validation

✓ Refus avec motif

✓ Badge de statut

✓ Photo

✓ Responsive

Résultat attendu

L'administrateur peut :

consulter toutes les structures ;
rechercher rapidement une structure ;
filtrer les résultats ;
consulter les informations détaillées ;
valider une structure ;
refuser une structure avec un motif ;
suivre le statut de chaque structure depuis une interface unique et modulaire.
BLOC 4 — Gestion des Gestionnaires
Objectif

Permettre à l'administrateur de gérer les comptes des gestionnaires des hôpitaux et des pharmacies.

Dossiers à créer
src/features/admin/managers/

├── api/
├── hooks/
├── types/
├── validation/
├── store/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/managers/pages/ManagersPage.tsx

features/admin/managers/api/managers.service.ts

features/admin/managers/hooks/useManagers.ts
features/admin/managers/hooks/useManager.ts
features/admin/managers/hooks/useCreateManager.ts
features/admin/managers/hooks/useSuspendManager.ts
features/admin/managers/hooks/useReactivateManager.ts
features/admin/managers/hooks/useResetPassword.ts

features/admin/managers/store/managers-store.ts

features/admin/managers/types/manager.ts

features/admin/managers/validation/create-manager.schema.ts

features/admin/managers/components/ManagersTable.tsx
features/admin/managers/components/ManagerSearch.tsx
features/admin/managers/components/ManagerFilters.tsx
features/admin/managers/components/CreateManagerDialog.tsx
features/admin/managers/components/ManagerDetails.tsx
features/admin/managers/components/ManagerStatusBadge.tsx
features/admin/managers/components/ManagerActions.tsx
features/admin/managers/components/AssignStructure.tsx
features/admin/managers/components/ResetPasswordDialog.tsx
features/admin/managers/components/SuspendDialog.tsx
Fichier à créer
src/app/[locale]/admin/managers/page.tsx

Charge uniquement :

<ManagersPage />
Layout
ManagersPage

├── ManagerSearch
├── ManagerFilters
├── ManagersTable
└── ManagerDetails
ManagersTable

Colonnes :

Photo
Nom
Email
Téléphone
Structure
Type de structure
Statut
Date de création
Actions
ManagerSearch

Recherche par :

nom
email
structure
ManagerFilters

Filtres :

Tous
Actifs
Suspendus
Hôpitaux
Pharmacies
CreateManagerDialog

Création d'un gestionnaire.

Informations :

Nom
Email
Téléphone
Structure

Le mot de passe est généré par le backend puis envoyé par email. L'administrateur ne le voit jamais.

AssignStructure

Associer un gestionnaire à :

un hôpital
une pharmacie

Une seule structure par gestionnaire.

ManagerDetails

Afficher :

informations personnelles
structure associée
historique
date de création
dernière connexion
ManagerActions

Actions :

Voir
Suspendre
Réactiver
Réinitialiser le mot de passe
SuspendDialog

Confirmer la suspension.

ResetPasswordDialog

Confirmer la réinitialisation.

Le backend génère un nouveau mot de passe et l'envoie au gestionnaire.

Hooks
useManagers.ts
liste
pagination
recherche
filtres
useManager.ts

Chargement d'un gestionnaire.

useCreateManager.ts

Création.

useSuspendManager.ts

Suspension.

useReactivateManager.ts

Réactivation.

useResetPassword.ts

Réinitialisation du mot de passe.

Store
managers-store.ts

Contient :

selectedManager

filters

search

page

pageSize
Fonctionnalités

✓ Recherche

✓ Pagination

✓ Filtres

✓ Création

✓ Association à une structure

✓ Suspension

✓ Réactivation

✓ Réinitialisation du mot de passe

✓ Consultation des informations

✓ Responsive

Résultat attendu

L'administrateur peut :

créer un gestionnaire ;
associer ce gestionnaire à une structure ;
consulter ses informations ;
suspendre ou réactiver son compte ;
réinitialiser son mot de passe via le backend ;
gérer l'ensemble des gestionnaires depuis une interface unique, modulaire et découplée.
BLOC 5 — Gestion des Utilisateurs Publics
Objectif

Permettre à l'administrateur de consulter et gérer les comptes des utilisateurs publics de la plateforme.

Dossiers à créer
src/features/admin/users/

├── api/
├── hooks/
├── types/
├── store/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/users/pages/UsersPage.tsx

features/admin/users/api/users.service.ts

features/admin/users/hooks/useUsers.ts
features/admin/users/hooks/useUser.ts
features/admin/users/hooks/useSuspendUser.ts
features/admin/users/hooks/useReactivateUser.ts
features/admin/users/hooks/useDeleteUser.ts

features/admin/users/store/users-store.ts

features/admin/users/types/user.ts

features/admin/users/components/UsersTable.tsx
features/admin/users/components/UserSearch.tsx
features/admin/users/components/UserFilters.tsx
features/admin/users/components/UserDetails.tsx
features/admin/users/components/UserActions.tsx
features/admin/users/components/UserStatusBadge.tsx
features/admin/users/components/SuspendUserDialog.tsx
features/admin/users/components/DeleteUserDialog.tsx
features/admin/users/components/UserAvatar.tsx
Fichier à créer
src/app/[locale]/admin/users/page.tsx

Charge uniquement :

<UsersPage />
Layout
UsersPage

├── UserSearch
├── UserFilters
├── UsersTable
└── UserDetails
UsersTable

Colonnes :

Avatar
Nom
Email
Téléphone (si disponible)
Date d'inscription
Dernière connexion
Statut
Actions
UserSearch

Recherche par :

nom
email
UserFilters

Filtres :

Tous
Actifs
Suspendus
UserDetails

Afficher :

photo
nom
email
téléphone
date d'inscription
dernière connexion
nombre de favoris
nombre de feedbacks envoyés

Lecture seule.

UserActions

Actions :

Voir
Suspendre
Réactiver
Supprimer (suppression logique)
SuspendUserDialog

Confirmation avant suspension.

DeleteUserDialog

Confirmation avant suppression logique.

UserStatusBadge

Afficher :

Actif
Suspendu
Hooks
useUsers.ts
liste
pagination
recherche
filtres
useUser.ts

Chargement d'un utilisateur.

useSuspendUser.ts

Suspendre un utilisateur.

useReactivateUser.ts

Réactiver un utilisateur.

useDeleteUser.ts

Suppression logique.

Store
users-store.ts

Contient :

selectedUser

filters

search

page

pageSize
Fonctionnalités

✓ Recherche

✓ Pagination

✓ Filtres

✓ Consultation

✓ Suspension

✓ Réactivation

✓ Suppression logique

✓ Responsive

Résultat attendu

L'administrateur peut :

consulter tous les utilisateurs publics ;
rechercher un utilisateur ;
filtrer la liste ;
consulter son profil ;
suspendre ou réactiver son compte ;
effectuer une suppression logique sans supprimer définitivement les données.
BLOC 7 — Carte de Supervision des Structures
Objectif

Permettre à l'administrateur de visualiser toutes les structures enregistrées sur une carte interactive et d'accéder rapidement à leurs informations.

Dossiers à créer
src/features/admin/map/

├── api/
├── hooks/
├── store/
├── types/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/map/pages/MapPage.tsx

features/admin/map/api/map.service.ts

features/admin/map/hooks/useStructuresMap.ts
features/admin/map/hooks/useMapFilters.ts

features/admin/map/store/map-store.ts

features/admin/map/types/map.ts

features/admin/map/components/AdminMap.tsx
features/admin/map/components/StructureMarker.tsx
features/admin/map/components/StructurePopup.tsx
features/admin/map/components/MapFilters.tsx
features/admin/map/components/MapLegend.tsx
features/admin/map/components/MapSidebar.tsx
features/admin/map/components/MapSearch.tsx
features/admin/map/components/MapToolbar.tsx
Fichier à créer
src/app/[locale]/admin/map/page.tsx

Charge uniquement :

<MapPage />
Layout
MapPage

├── MapToolbar
├── MapFilters
├── AdminMap
└── MapSidebar
AdminMap

Afficher :

toutes les structures
marqueurs interactifs
regroupement des marqueurs (cluster) si nécessaire
recentrage automatique
StructureMarker

Icône différente selon :

Hôpital
Pharmacie

Couleur selon le statut :

En attente
Validée
Refusée
StructurePopup

Afficher :

photo
nom
type
adresse
téléphone
statut
bouton "Voir les détails"
MapFilters

Filtres :

Toutes
Hôpitaux
Pharmacies
En attente
Validées
Refusées

Filtres combinables.

MapSearch

Recherche par :

nom
adresse

La carte se centre automatiquement sur le résultat.

MapLegend

Afficher la signification des icônes :

Hôpital
Pharmacie
En attente
Validée
Refusée
MapSidebar

Afficher la liste des structures visibles sur la carte.

Informations :

photo
nom
type
statut

Cliquer sur un élément :

ouvre le popup
centre la carte
MapToolbar

Actions :

Recentrer
Localiser une structure
Réinitialiser les filtres
Hooks
useStructuresMap.ts

Responsabilité :

charger les structures
synchroniser la carte
useMapFilters.ts

Responsabilité :

gérer les filtres
gérer la recherche
Store
map-store.ts

Contient :

selectedStructure

search

filters

mapCenter

zoom
Fonctionnalités

✓ Carte interactive

✓ Recherche

✓ Filtres

✓ Popup

✓ Recentrage

✓ Synchronisation carte/liste

✓ Cluster des marqueurs

✓ Responsive

Bibliothèques

Réutiliser celles déjà présentes dans le projet :

Leaflet
React Leaflet

Aucune nouvelle bibliothèque cartographique.

Résultat attendu

L'administrateur dispose d'une carte de supervision complète lui permettant de :

visualiser toutes les structures de la plateforme ;
filtrer les structures selon leur type ou leur statut ;
rechercher une structure ;
consulter rapidement ses informations ;
accéder à sa fiche détaillée ;
naviguer efficacement entre la carte et la liste des structures.
BLOC 8 — Statistiques & Analytics
Objectif

Fournir à l'administrateur une vision complète de l'activité de la plateforme grâce à des indicateurs, graphiques et tableaux de bord.

Dossiers à créer
src/features/admin/statistics/

├── api/
├── hooks/
├── store/
├── types/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/statistics/pages/StatisticsPage.tsx

features/admin/statistics/api/statistics.service.ts

features/admin/statistics/hooks/useStatistics.ts
features/admin/statistics/hooks/useStatisticsFilters.ts

features/admin/statistics/store/statistics-store.ts

features/admin/statistics/types/statistics.ts

features/admin/statistics/components/StatisticsCards.tsx
features/admin/statistics/components/StatisticsCharts.tsx
features/admin/statistics/components/StatisticsFilters.tsx
features/admin/statistics/components/StatisticsExport.tsx
features/admin/statistics/components/StatisticsTable.tsx
features/admin/statistics/components/TopSearches.tsx
features/admin/statistics/components/PopularStructures.tsx
features/admin/statistics/components/StatisticsPeriod.tsx
Fichier à créer
src/app/[locale]/admin/statistics/page.tsx

Charge uniquement :

<StatisticsPage />
Layout
StatisticsPage

├── StatisticsPeriod
├── StatisticsFilters
├── StatisticsCards
├── StatisticsCharts
├── TopSearches
├── PopularStructures
├── StatisticsTable
└── StatisticsExport
StatisticsCards

Afficher :

Nombre total de recherches
Utilisateurs inscrits
Gestionnaires
Structures
Hôpitaux
Pharmacies
Feedbacks reçus
Messages échangés
StatisticsCharts

Prévoir les graphiques :

recherches par jour
recherches par mois
inscriptions
validations
évolution des structures
répartition Hôpital / Pharmacie
StatisticsPeriod

Choix de la période :

Aujourd'hui
7 jours
30 jours
12 mois
Personnalisée
StatisticsFilters

Filtres :

période
type de structure
région (future évolution)
TopSearches

Afficher les recherches les plus fréquentes.

PopularStructures

Afficher les structures les plus consultées.

StatisticsTable

Afficher les données détaillées selon les filtres sélectionnés.

StatisticsExport

Prévoir les exports :

PDF
Excel
CSV
Hooks
useStatistics.ts

Responsabilité :

charger toutes les statistiques.

useStatisticsFilters.ts

Responsabilité :

gérer les filtres et la période.

Store
statistics-store.ts

Contient :

period

filters

selectedChart

exportFormat
Fonctionnalités

✓ KPI

✓ Graphiques

✓ Filtres

✓ Choix de période

✓ Export

✓ Responsive

Bibliothèques

Conserver une seule bibliothèque de graphiques pour tout le projet afin de garder une interface cohérente.

Résultat attendu

L'administrateur dispose d'un module d'analyse lui permettant de suivre l'évolution de la plateforme, les recherches, les inscriptions, les structures les plus consultées et d'exporter les statistiques selon la période souhaitée.
BLOC 9 — Feedback Utilisateurs
Objectif

Permettre à l'administrateur de consulter, traiter et suivre tous les retours envoyés par les utilisateurs concernant la plateforme SantéProx (et non les structures médicales).

Dossiers à créer
src/features/admin/feedback/

├── api/
├── hooks/
├── store/
├── types/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/feedback/pages/FeedbackPage.tsx

features/admin/feedback/api/feedback.service.ts

features/admin/feedback/hooks/useFeedbacks.ts
features/admin/feedback/hooks/useFeedback.ts
features/admin/feedback/hooks/useUpdateFeedbackStatus.ts

features/admin/feedback/store/feedback-store.ts

features/admin/feedback/types/feedback.ts

features/admin/feedback/components/FeedbackTable.tsx
features/admin/feedback/components/FeedbackFilters.tsx
features/admin/feedback/components/FeedbackSearch.tsx
features/admin/feedback/components/FeedbackDetails.tsx
features/admin/feedback/components/FeedbackStatusBadge.tsx
features/admin/feedback/components/FeedbackActions.tsx
features/admin/feedback/components/FeedbackCategoryBadge.tsx
Fichier à créer
src/app/[locale]/admin/feedback/page.tsx

Charge uniquement :

<FeedbackPage />
Layout
FeedbackPage

├── FeedbackSearch
├── FeedbackFilters
├── FeedbackTable
└── FeedbackDetails
FeedbackTable

Colonnes :

Utilisateur
Catégorie
Sujet
Date
Statut
Actions
FeedbackSearch

Recherche par :

nom
email
sujet
FeedbackFilters

Filtres :

Tous
Non lus
Lus
Traités

Catégories :

Bug
Suggestion
Signalement
Autre
FeedbackDetails

Afficher :

utilisateur
email
catégorie
sujet
message complet
date
statut

Lecture seule.

FeedbackActions

Actions :

Voir
Marquer comme lu
Marquer comme traité
FeedbackStatusBadge

Afficher :

Non lu
Lu
Traité
FeedbackCategoryBadge

Afficher :

Bug
Suggestion
Signalement
Autre
Hooks
useFeedbacks.ts

Responsabilité :

liste
recherche
filtres
pagination
useFeedback.ts

Chargement d'un feedback.

useUpdateFeedbackStatus.ts

Modification du statut.

Store
feedback-store.ts

Contient :

selectedFeedback

search

filters

page

pageSize
Fonctionnalités

✓ Recherche

✓ Pagination

✓ Filtres

✓ Consultation

✓ Marquer comme lu

✓ Marquer comme traité

✓ Responsive

Résultat attendu

L'administrateur peut :

consulter tous les retours des utilisateurs ;
rechercher un feedback ;
filtrer par catégorie ou statut ;
lire le message complet ;
suivre le traitement des retours grâce à un système de statuts.
BLOC 10 — Messagerie Temps Réel (WebSocket)
Objectif

Permettre une communication en temps réel entre l'administrateur et les gestionnaires de structures (hôpitaux et pharmacies). Une structure ne peut discuter qu'avec l'administrateur.

Dossiers à créer
src/features/admin/chat/

├── api/
├── hooks/
├── websocket/
├── store/
├── types/
├── pages/
├── components/
├── utils/
└── services/
Fichiers à créer
features/admin/chat/pages/ChatPage.tsx

features/admin/chat/api/chat.service.ts

features/admin/chat/services/chatSocket.ts

features/admin/chat/hooks/useConversations.ts
features/admin/chat/hooks/useMessages.ts
features/admin/chat/hooks/useSendMessage.ts
features/admin/chat/hooks/useChatSocket.ts

features/admin/chat/store/chat-store.ts

features/admin/chat/types/chat.ts

features/admin/chat/components/ConversationList.tsx
features/admin/chat/components/ConversationItem.tsx
features/admin/chat/components/ConversationFilters.tsx
features/admin/chat/components/ConversationSearch.tsx
features/admin/chat/components/ConversationHeader.tsx
features/admin/chat/components/MessageList.tsx
features/admin/chat/components/MessageBubble.tsx
features/admin/chat/components/MessageInput.tsx
features/admin/chat/components/ChatEmpty.tsx
features/admin/chat/components/TypingIndicator.tsx
features/admin/chat/components/UnreadBadge.tsx
Fichier à créer
src/app/[locale]/admin/chat/page.tsx

Charge uniquement :

<ChatPage />
Layout
ChatPage

├── ConversationSearch
├── ConversationFilters
├── ConversationList
│
└── Conversation
    ├── ConversationHeader
    ├── MessageList
    └── MessageInput
ConversationSearch

Recherche par :

nom de la structure

Recherche instantanée.

ConversationFilters

Filtres :

Toutes
Non lus
Hôpitaux
Pharmacies
ConversationList

Afficher :

photo
nom
type
dernier message
heure
badge non lu

Tri :

Plus récent → plus ancien.

ConversationHeader

Afficher :

photo
nom
type
statut de connexion (En ligne / Hors ligne)
MessageList

Afficher :

historique
heure
accusé de réception (prévoir)
séparation par date
MessageBubble

Deux styles :

message administrateur
message structure
MessageInput

Fonctions :

saisie
envoyer
touche Entrée
bouton Envoyer
TypingIndicator

Prévoir l'affichage :

La structure est en train d'écrire...
UnreadBadge

Afficher le nombre de messages non lus.

Hooks
useConversations.ts
liste
recherche
filtres
useMessages.ts

Chargement des messages.

useSendMessage.ts

Envoi des messages.

useChatSocket.ts

Connexion WebSocket.

Service
chatSocket.ts

Responsabilités :

connexion
reconnexion automatique
réception
envoi
déconnexion
Store
chat-store.ts

Contient :

selectedConversation

conversations

messages

unreadCount

typing

connected
Fonctionnalités

✓ Temps réel (WebSocket)

✓ Recherche

✓ Filtres

✓ Messages non lus

✓ Historique

✓ Statut en ligne

✓ Indicateur de frappe

✓ Responsive

Résultat attendu

L'administrateur dispose d'une messagerie inspirée de WhatsApp, adaptée au contexte de SantéProx, lui permettant de :

rechercher une structure ;
filtrer les conversations (Toutes, Non lues, Hôpitaux, Pharmacies) ;
échanger des messages en temps réel avec chaque structure ;
suivre les messages non lus et l'état de connexion des gestionnaires.

BLOC 11 — Paramètres Administrateur
Objectif

Permettre à l'administrateur de gérer son compte et ses préférences personnelles.

Dossiers à créer
src/features/admin/settings/

├── api/
├── hooks/
├── store/
├── types/
├── validation/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/admin/settings/pages/SettingsPage.tsx

features/admin/settings/api/settings.service.ts

features/admin/settings/hooks/useProfile.ts
features/admin/settings/hooks/useUpdateProfile.ts
features/admin/settings/hooks/useUpdatePassword.ts
features/admin/settings/hooks/useUpdatePreferences.ts

features/admin/settings/store/settings-store.ts

features/admin/settings/types/settings.ts

features/admin/settings/validation/profile.schema.ts
features/admin/settings/validation/password.schema.ts

features/admin/settings/components/ProfileCard.tsx
features/admin/settings/components/ProfilePhoto.tsx
features/admin/settings/components/ProfileForm.tsx
features/admin/settings/components/PasswordForm.tsx
features/admin/settings/components/PreferencesForm.tsx
features/admin/settings/components/ThemeSelector.tsx
features/admin/settings/components/LanguageSelector.tsx
features/admin/settings/components/NotificationPreferences.tsx
Fichier à créer
src/app/[locale]/admin/settings/page.tsx

Charge uniquement :

<SettingsPage />
Layout
SettingsPage

├── ProfileCard
├── ProfileForm
├── PasswordForm
└── PreferencesForm
ProfileCard

Afficher :

Photo
Nom
Email
Date de création du compte
Dernière connexion
ProfileForm

Modification de :

Photo
Nom
Email
PasswordForm

Modification :

Mot de passe actuel
Nouveau mot de passe
Confirmation
PreferencesForm

Préférences :

Langue
Thème (Clair / Sombre / Système)
Notifications
NotificationPreferences

Prévoir l'activation/désactivation des notifications :

Nouveaux messages
Nouvelles structures
Nouveaux feedbacks
Validations
Hooks
useProfile.ts

Chargement du profil.

useUpdateProfile.ts

Mise à jour du profil.

useUpdatePassword.ts

Modification du mot de passe.

useUpdatePreferences.ts

Mise à jour des préférences.

Store
settings-store.ts

Contient :

profile

preferences

theme

language
Validation

Créer :

profile.schema.ts

password.schema.ts

Validation avec Zod.

Fonctionnalités

✓ Modifier la photo

✓ Modifier le nom

✓ Modifier l'email

✓ Modifier le mot de passe

✓ Changer la langue

✓ Changer le thème

✓ Gérer les préférences de notifications

✓ Responsive

Résultat attendu

L'administrateur dispose d'un espace unique pour gérer son profil, son mot de passe et ses préférences d'utilisation sans impacter les autres modules du dashboard.

NB: IMPORTANT A PRENDRE EN COMPTE LE WORKFLOW POUR CREER UN GESTIONNAIRE D UNE STRUCTURE MEDICAL

bien on vas parler des etape que nous avons valider pour la creation d'un compte gestionnaire et d'un patient nous avons dit l'admin depuis son dashboard ecrit l'email du gestionnaire puis clique sur le bouton envoyer email ensuite un email est envoyer a au gestionnaire dans sa boite a l'interieur de le message de l'email doit contenir un code a 4 chiffre puis un message votre compte est sur le point d'etre creer dans notre plateforme disans attander d'etre dans votre structure puis activer la localisation sur votre appareil pour la geolocalisation de votre structure cliquer sur le lien et entrer le code a quatre 4 si dessous puis remplisser les information de votre structure. une foit le code a 4 chiffre entrer si c'est correcte une nouvelle fenetre s'ouvre et le gestionnaire replis les information de sa structure le system doit lui demander d'activer la localisation si il n'active pas alors les champs latitude et longitude serons obligatoire .quand le gestionnaire soumetra le formulaire le system devra se servir de sa localisation pour identier directement et renseigner dans le system ou se trouve sa sctucture. un message devra etre afficher au gestionnaire: vos information sont en attende de validation une fois traiter nous vous enverons un mail. puis une notification sera envoye a l'admin qui se chargeara de valider ou de refuser la structure si il refuse il doit justifier et apres la validation/refus on envera le mail au gestionnaire pour lui faire de la situation si accepter ou refuser(avec justification) tout le backend devra faire c'est etape a l'arriere et en se qui concerne la connexion du patient la connexion sera exiger si il veut donner un avis sur la plateforme il y'aura la connexion avec google et la creation de compte avec google donc si l'utilisateur clique su noter la plateforme un modal de connexion s'ouvrira et il pourra creer le compte avec google ou entre juste un email et un mot de passe je pense que c'est tout pour le coter utilisateur.si j'ai oublier une chose rappel moi et je me pose aussi une question une fois que gestionnaire aura creer sa structure comment va t'il se connecter a son dashboard ?