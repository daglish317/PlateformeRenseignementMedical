BLOC 1 — Architecture commune des Dashboards Hôpital & Pharmacie
Objectif

Mettre en place toute l'architecture commune des deux dashboards.

Aucune fonctionnalité métier n'est implémentée ici.

Ce bloc sert uniquement à construire le shell des dashboards.

Dossiers à créer
src/features/shared/dashboard/

├── layout/
├── navigation/
├── hooks/
├── types/
├── components/
└── utils/
Fichiers à créer
features/shared/dashboard/layout/DashboardLayout.tsx

features/shared/dashboard/layout/DashboardHeader.tsx

features/shared/dashboard/layout/DashboardSidebar.tsx

features/shared/dashboard/layout/DashboardContent.tsx

features/shared/dashboard/layout/DashboardBreadcrumb.tsx

features/shared/dashboard/layout/DashboardFooter.tsx

features/shared/dashboard/navigation/hospital-navigation.ts

features/shared/dashboard/navigation/pharmacy-navigation.ts

features/shared/dashboard/hooks/useDashboardNavigation.ts

features/shared/dashboard/types/navigation.ts

features/shared/dashboard/components/SidebarMenu.tsx

features/shared/dashboard/components/SidebarMenuItem.tsx

features/shared/dashboard/components/SidebarGroup.tsx

features/shared/dashboard/components/PageTitle.tsx

features/shared/dashboard/components/PageContainer.tsx

features/shared/dashboard/components/SectionCard.tsx
Fichiers à modifier

Créer les layouts des deux dashboards.

src/app/[locale]/hospital/layout.tsx

src/app/[locale]/pharmacy/layout.tsx

Ils utiliseront tous les deux :

<DashboardLayout />

Aucun layout spécifique.

DashboardLayout

Responsabilités :

Sidebar
Header
Breadcrumb
Contenu principal
Footer Dashboard

Aucune logique métier.

DashboardSidebar

Responsabilités :

Afficher automatiquement le menu selon le rôle.

Hospital :

Dashboard

Profil

Services

Analyses

Plateaux techniques

Prises en charge

Horaires

Messages

Notifications

Statistiques

Paramètres

Pharmacy :

Dashboard

Profil

Stock

Horaires

Messages

Notifications

Statistiques

Paramètres

Le composant reste identique.

Seul le fichier navigation change.

DashboardHeader

Afficher :

Breadcrumb
Recherche interne (future extension)
Notifications
Avatar utilisateur

Aucune recherche médicale.

DashboardBreadcrumb

Construit automatiquement :

Exemple :

Dashboard

↓

Services

↓

Créer
DashboardContent

Responsable uniquement :

largeur
padding
responsive
scroll
DashboardFooter

Footer minimal.

Afficher :

SantéProx

Version

Copyright

Ne pas réutiliser le footer public.

SidebarMenu

Construit automatiquement le menu.

Aucune logique.

SidebarMenuItem

Afficher :

icône
label
badge éventuel
SidebarGroup

Permet de regrouper les menus.

Exemple :

Gestion

Communication

Configuration
PageTitle

Titre uniforme pour tous les modules.

PageContainer

Conteneur standard.

Même largeur pour tous les écrans.

SectionCard

Carte réutilisable dans tous les dashboards.

Navigation

Créer :

hospital-navigation.ts

pharmacy-navigation.ts

Ils contiennent uniquement :

label

icon

href

permission

Aucune logique React.

Hook

Créer :

useDashboardNavigation.ts

Responsabilités :

charger la bonne navigation selon le rôle ;
retourner le menu actif ;
gérer l'élément sélectionné.
Types

Créer :

navigation.ts

Définir :

NavigationItem
NavigationGroup
SidebarSection
Réutilisation des blocs déjà définis

Ne pas recréer :

shared/chat/

shared/notifications/

shared/profile/

Ils seront simplement intégrés dans le DashboardLayout.

Fonctionnalités

✓ Sidebar responsive

✓ Header commun

✓ Breadcrumb


✓ Navigation dynamique

✓ Responsive

✓ Réutilisable par Hôpital et Pharmacie

✓ Aucune logique métier

Résultat attendu

Les dashboards Hôpital et Pharmacie reposent sur une architecture commune unique, avec un seul layout partagé. La seule différence entre les deux réside dans leur fichier de navigation, ce qui évite toute duplication de code et facilite l'évolution future de l'application.
BLOC 2 — Profil de la Structure (Hôpital & Pharmacie)
Objectif

Permettre au gestionnaire de consulter et de modifier uniquement les informations de sa propre structure.

Ce module est identique pour les hôpitaux et les pharmacies.

Il repose directement sur le modèle Structure déjà présent dans le backend.

Dossiers à créer
src/features/shared/structure-profile/

├── api/
├── hooks/
├── store/
├── types/
├── validation/
├── pages/
├── components/
└── utils/
Fichiers à créer
features/shared/structure-profile/pages/StructureProfilePage.tsx

features/shared/structure-profile/api/structure-profile.service.ts

features/shared/structure-profile/hooks/useStructureProfile.ts
features/shared/structure-profile/hooks/useUpdateStructure.ts
features/shared/structure-profile/hooks/useUploadStructurePhoto.ts
features/shared/structure-profile/hooks/useDeleteStructurePhoto.ts

features/shared/structure-profile/store/structure-profile-store.ts

features/shared/structure-profile/types/structure-profile.ts

features/shared/structure-profile/validation/structure-profile.schema.ts

features/shared/structure-profile/components/ProfileHeader.tsx
features/shared/structure-profile/components/ProfilePhoto.tsx
features/shared/structure-profile/components/ProfileInformations.tsx
features/shared/structure-profile/components/ProfileLocation.tsx
features/shared/structure-profile/components/ProfileContact.tsx
features/shared/structure-profile/components/ProfileActions.tsx
features/shared/structure-profile/components/ProfileForm.tsx
Fichiers à créer
src/app/[locale]/hospital/profile/page.tsx

src/app/[locale]/pharmacy/profile/page.tsx

Ces deux pages chargent uniquement :

<StructureProfilePage />

Aucun code spécifique.

Layout
StructureProfilePage

├── ProfileHeader

├── ProfilePhoto

├── ProfileInformations

├── ProfileContact

├── ProfileLocation

└── ProfileActions
ProfileHeader

Afficher :

Nom de la structure
Type
Statut
Date de création
ProfilePhoto

Afficher :

Photo actuelle

Actions :

Modifier
Supprimer

Formats acceptés :

JPG
PNG
WEBP

Prévisualisation avant envoi.

ProfileInformations

Afficher et modifier :

Nom
Type (lecture seule)
Adresse

Le type n'est jamais modifiable.

ProfileContact

Afficher et modifier :

Téléphone
ProfileLocation

Afficher :

Latitude
Longitude

Ces valeurs proviennent du backend.

Le gestionnaire peut uniquement les modifier si l'API le permet.

Aucune carte interactive.

ProfileActions

Actions disponibles :

Enregistrer
Annuler
Hooks
useStructureProfile.ts

Responsabilité :

charger les informations de la structure.

useUpdateStructure.ts

Responsabilité :

mettre à jour les informations.

useUploadStructurePhoto.ts

Responsabilité :

envoyer la nouvelle photo.

useDeleteStructurePhoto.ts

Responsabilité :

supprimer la photo actuelle.

Store

Créer :

structure-profile-store.ts

Contient :

structure

isEditing

photoPreview
Validation

Créer :

structure-profile.schema.ts

Validation :

nom
téléphone
adresse
coordonnées
Service

Créer :

structure-profile.service.ts

Responsable uniquement des appels API.

Types

Créer :

structure-profile.ts

Définir :

StructureProfile
UpdateStructurePayload
UploadPhotoPayload
Fonctionnalités

✓ Consultation du profil

✓ Modification des informations

✓ Modification de la photo

✓ Suppression de la photo

✓ Validation des formulaires

✓ Responsive

✓ Architecture commune Hôpital / Pharmacie

Réutilisation

Ce module est partagé par :

Hospital Dashboard

Pharmacy Dashboard

Aucun code ne devra être dupliqué.

Résultat attendu

Le gestionnaire d'un hôpital comme celui d'une pharmacie dispose d'une page unique pour consulter et mettre à jour les informations de sa structure. L'architecture est entièrement mutualisée, sans duplication entre les deux dashboards, et reste alignée avec le modèle Structure du backend.
BLOC 3 — Gestion des Horaires (Hôpital & Pharmacie)
Objectif

Permettre au gestionnaire de gérer les horaires de sa structure.

Module commun basé sur le modèle Horaire du backend.

Dossier à créer
src/features/shared/schedules/
Fichiers à créer
features/shared/schedules/pages/SchedulesPage.tsx

features/shared/schedules/api/schedules.service.ts

features/shared/schedules/hooks/useSchedules.ts
features/shared/schedules/hooks/useCreateSchedules.ts
features/shared/schedules/hooks/useUpdateSchedule.ts

features/shared/schedules/store/schedules-store.ts

features/shared/schedules/types/schedule.ts

features/shared/schedules/validation/schedule.schema.ts

features/shared/schedules/components/ScheduleTable.tsx
features/shared/schedules/components/ScheduleRow.tsx
features/shared/schedules/components/ScheduleForm.tsx
features/shared/schedules/components/ScheduleActions.tsx
features/shared/schedules/components/ClosedSwitch.tsx
Pages à créer
src/app/[locale]/hospital/schedules/page.tsx

src/app/[locale]/pharmacy/schedules/page.tsx

Chargent uniquement :

<SchedulesPage />
Layout
SchedulesPage

├── ScheduleActions
├── ScheduleTable
└── ScheduleForm
ScheduleTable

Afficher :

Jour
Heure ouverture
Heure fermeture
Fermé
Actions
ScheduleActions

Actions :

Modifier
Enregistrer
ScheduleForm

Modifier :

Jour
Heure ouverture
Heure fermeture
Fermé
Hooks
useSchedules.ts
Charger les horaires
useCreateSchedules.ts
Enregistrement des horaires
useUpdateSchedule.ts
Modification d'un horaire
Store
schedules-store.ts

Contient :

schedules

editingSchedule
Validation
schedule.schema.ts

Validation :

ouverture < fermeture
jour unique
horaires obligatoires si non fermé
Fonctionnalités
Consultation
Modification
Validation
Responsive
Réutilisation

Commun :

Dashboard Hôpital
Dashboard Pharmacie
BLOC 4 — Messagerie & Notifications (Hôpital & Pharmacie)
Objectif

Réutiliser les modules déjà prévus afin que les gestionnaires puissent communiquer avec l'administrateur et consulter leurs notifications.

Aucun nouveau dossier

Réutiliser :

src/features/shared/chat/

src/features/shared/notifications/
Fichiers à créer
src/app/[locale]/hospital/chat/page.tsx

src/app/[locale]/hospital/notifications/page.tsx

src/app/[locale]/pharmacy/chat/page.tsx

src/app/[locale]/pharmacy/notifications/page.tsx

Ils chargent uniquement :

<ChatPage />

<NotificationsPage />
Fichiers à modifier
features/shared/chat/

Adapter les hooks pour que le rôle connecté soit automatiquement pris en compte.

features/shared/notifications/

Adapter le chargement des notifications selon le rôle.

Chat

Fonctionnalités

Conversation avec l'administrateur
Temps réel (WebSocket)
Recherche
Messages non lus
Historique
Indicateur de frappe
Statut en ligne
Pièces jointes (si API disponible)
Notifications

Afficher :

Nouveau message
Validation de la structure
Refus de la structure
Nouveau rappel
Notification système

Actions :

Marquer comme lue
Tout marquer comme lu
Fonctionnalités
Temps réel
Responsive
Réutilisation complète des composants partagés
Aucun code dupliqué
Résultat attendu

Les dashboards Hôpital et Pharmacie utilisent exactement les mêmes modules de messagerie et de notifications que l'administrateur. Seules les données changent selon le rôle connecté.
BLOC 5 — Dashboard d'Accueil (Hôpital & Pharmacie)
Objectif

Créer la page d'accueil du dashboard avec des indicateurs propres à la structure connectée.

Dossiers à créer
src/features/shared/dashboard-home/
Fichiers à créer
features/shared/dashboard-home/pages/DashboardHomePage.tsx

features/shared/dashboard-home/api/dashboard-home.service.ts

features/shared/dashboard-home/hooks/useDashboardHome.ts

features/shared/dashboard-home/types/dashboard-home.ts

features/shared/dashboard-home/components/WelcomeCard.tsx
features/shared/dashboard-home/components/StatisticsCards.tsx
features/shared/dashboard-home/components/QuickActions.tsx
features/shared/dashboard-home/components/RecentActivity.tsx
features/shared/dashboard-home/components/StatusCard.tsx
Pages à créer
src/app/[locale]/hospital/page.tsx

src/app/[locale]/pharmacy/page.tsx

Chargent uniquement :

<DashboardHomePage />
Layout
DashboardHomePage

├── WelcomeCard
├── StatisticsCards
├── QuickActions
├── RecentActivity
└── StatusCard
WelcomeCard

Afficher :

Nom de la structure
Type
Statut
StatisticsCards
Hôpital
Nombre de services
Nombre d'analyses
Nombre de plateaux techniques
Nombre de prises en charge
Pharmacie
Nombre de médicaments
Produits disponibles
Produits en rupture
Stock faible
QuickActions
Hôpital
Ajouter un service
Ajouter une analyse
Ajouter une prise en charge
Pharmacie
Ajouter un médicament
Mettre à jour un stock
Importer un fichier Excel
RecentActivity

Afficher les dernières opérations réalisées par le gestionnaire.

StatusCard

Afficher :

Structure validée / en attente / refusée
Dernière mise à jour
Dernière connexion
Hook
useDashboardHome.ts

Responsabilités :

Charger toutes les données du tableau de bord.
Fonctionnalités
KPI adaptés au type de structure
Activité récente
Actions rapides
Responsive
Réutilisation

Le même module est utilisé pour les deux dashboards. Seuls les indicateurs et les actions rapides changent selon que la structure est un hôpital ou une pharmacie.
BLOC 6 — Modules métier Hôpital (Services + Analyses + Plateaux techniques + Prises en charge)
Objectif

Regrouper tous les modules spécifiques au dashboard Hôpital, avec une architecture homogène et les fonctionnalités d'import/export exposées par le backend.

Dossiers à créer
src/features/hospital/

services/
analyses/
technical-platforms/
care-services/
1. Services
Fichiers
features/hospital/services/

pages/ServicesPage.tsx

api/services.service.ts

hooks/useServices.ts
hooks/useCreateService.ts
hooks/useUpdateService.ts
hooks/useDeleteService.ts

store/services-store.ts

types/service.ts

validation/service.schema.ts

components/ServiceTable.tsx
components/ServiceForm.tsx
components/ServiceActions.tsx
components/ServiceFilters.tsx
Fonctionnalités
Liste
CRUD
Recherche
Pagination
Import Excel (si API)
Export Excel
Export CSV
2. Analyses
Fichiers
features/hospital/analyses/

pages/AnalysesPage.tsx

api/analyses.service.ts

hooks/useAnalyses.ts
hooks/useCreateAnalysis.ts
hooks/useUpdateAnalysis.ts
hooks/useDeleteAnalysis.ts

store/analyses-store.ts

types/analysis.ts

validation/analysis.schema.ts

components/AnalysisTable.tsx
components/AnalysisForm.tsx
components/AnalysisActions.tsx
components/AnalysisFilters.tsx
Fonctionnalités
Liste
CRUD
Recherche
Pagination
Import Excel
Export Excel
Export CSV
3. Plateaux techniques
Fichiers
features/hospital/technical-platforms/

pages/TechnicalPlatformsPage.tsx

api/technical-platforms.service.ts

hooks/useTechnicalPlatforms.ts
hooks/useCreateTechnicalPlatform.ts
hooks/useUpdateTechnicalPlatform.ts
hooks/useDeleteTechnicalPlatform.ts

store/technical-platforms-store.ts

types/technical-platform.ts

validation/technical-platform.schema.ts

components/TechnicalPlatformTable.tsx
components/TechnicalPlatformForm.tsx
components/TechnicalPlatformActions.tsx
Fonctionnalités
Liste
CRUD
Recherche
Import Excel
Export Excel
Export CSV
4. Prises en charge
Fichiers
features/hospital/care-services/

pages/CareServicesPage.tsx

api/care-services.service.ts

hooks/useCareServices.ts
hooks/useCreateCareService.ts
hooks/useUpdateCareService.ts
hooks/useDeleteCareService.ts

store/care-services-store.ts

types/care-service.ts

validation/care-service.schema.ts

components/CareServiceTable.tsx
components/CareServiceForm.tsx
components/CareServiceActions.tsx
components/CareServiceFilters.tsx
Fonctionnalités
Liste
CRUD
Recherche
Pagination
Import Excel
Export Excel
Export CSV
Pages à créer
src/app/[locale]/hospital/services/page.tsx

src/app/[locale]/hospital/analyses/page.tsx

src/app/[locale]/hospital/technical-platforms/page.tsx

src/app/[locale]/hospital/care-services/page.tsx

Chaque page charge uniquement son composant Page.

Architecture commune

Chaque module suit la même structure :

Page

├── Actions
├── Filters
├── Table
└── Form
Actions

Tous les modules disposent des mêmes actions :

Ajouter
Modifier
Supprimer
Import Excel (si disponible)
Export Excel
Export CSV
Résultat attendu

Le dashboard Hôpital dispose de quatre modules métier indépendants, tous construits sur la même architecture, avec une interface homogène, une séparation claire des responsabilités et le support des imports/exports lorsque le backend les expose.
BLOC 7 — Module métier Pharmacie (Gestion du Stock)
Objectif

Permettre au gestionnaire de pharmacie de gérer entièrement son stock de médicaments, conformément aux fonctionnalités exposées par le backend.

Dossier à créer
src/features/pharmacy/stock/
Fichiers à créer
features/pharmacy/stock/

pages/StockPage.tsx

api/stock.service.ts

hooks/useStock.ts
hooks/useCreateStock.ts
hooks/useUpdateStock.ts
hooks/useDeleteStock.ts
hooks/useImportStock.ts
hooks/useExportStock.ts

store/stock-store.ts

types/stock.ts

validation/stock.schema.ts

components/StockTable.tsx
components/StockForm.tsx
components/StockActions.tsx
components/StockFilters.tsx
components/StockSearch.tsx
components/StockStatusBadge.tsx
components/StockQuantity.tsx
components/DeleteStockDialog.tsx
components/ImportStockDialog.tsx
Page à créer
src/app/[locale]/pharmacy/stock/page.tsx

Charge uniquement :

<StockPage />
Layout
StockPage

├── StockActions
├── StockSearch
├── StockFilters
├── StockTable
├── StockForm
└── DeleteStockDialog
StockTable

Afficher :

Médicament
Quantité
Disponibilité
Dernière mise à jour
Actions
StockSearch

Recherche instantanée par nom de médicament.

StockFilters

Filtres selon les possibilités offertes par le backend :

Disponible
Rupture
Stock faible
Tous
StockActions

Actions :

Ajouter
Modifier
Supprimer
Import Excel
Export Excel
Export CSV
StockForm

Gestion :

Médicament
Quantité
Disponibilité
StockStatusBadge

Afficher l'état :

Disponible
Stock faible
Rupture
StockQuantity

Affichage uniforme des quantités.

DeleteStockDialog

Confirmation avant suppression.

ImportStockDialog

Sélection et import d'un fichier Excel.

Hooks
useStock.ts
Liste
Recherche
Pagination
Filtres
useCreateStock.ts

Création.

useUpdateStock.ts

Modification.

useDeleteStock.ts

Suppression.

useImportStock.ts

Import Excel.

useExportStock.ts

Export :

Excel
CSV
Store
stock-store.ts

Contient :

stocks

selectedStock

search

filters

page

pageSize
Validation

Créer :

stock.schema.ts

Validation des formulaires avec Zod.

Fonctionnalités
Consultation du stock
CRUD complet
Recherche
Filtres
Pagination
Import Excel
Export Excel
Export CSV
Responsive
Résultat attendu

Le gestionnaire de pharmacie dispose d'un module unique lui permettant de gérer son stock de médicaments, d'effectuer des imports/exports et de retrouver rapidement un produit grâce à la recherche et aux filtres, tout en restant aligné avec les API du backend.
Dashboard Hôpital
Dashboard
Profil
Services
Analyses
Plateaux techniques
Prises en charge
Horaires
Chat
Notifications
Paramètres
Dashboard Pharmacie
Dashboard
Profil
Stock médicaments
Horaires
Chat
Notifications
Paramètres


NB TU TE SERVIRA DES DONNES EXPOSER PAR LE BACKEND ET IMPLEMENTERA SE QUI MANQUE

NB: IMPORTANT A PRENDRE EN COMPTE LE WORKFLOW POUR CREER UN GESTIONNAIRE D UNE STRUCTURE MEDICAL

bien on vas parler des etape que nous avons valider pour la creation d'un compte gestionnaire et d'un patient nous avons dit l'admin depuis son dashboard ecrit l'email du gestionnaire puis clique sur le bouton envoyer email ensuite un email est envoyer  au gestionnaire dans sa boite a l'interieur le message de l'email doit contenir un code a 4 chiffre puis un message votre compte est sur le point d'etre creer dans notre plateforme SantéProx disans attander d'etre dans votre structure puis activer la localisation sur votre appareil pour la geolocalisation de votre structure cliquer sur le lien et entrer le code a quatre 4 si dessous puis remplisser les information de votre structure. une foit le code a 4 chiffre entrer si c'est correcte une nouvelle fenetre s'ouvre et le gestionnaire replis les information de sa structure le system doit lui demander d'activer la localisation c'est obligatoire pour que le formulaire soit soumis si non rien est envoyer on lui demande d'activer la localisation.quand le gestionnaire soumetra le formulaire le system devra se servir de sa localisation pour identier directement et renseigner dans le system ou se trouve sa sctucture. un message devra etre afficher au gestionnaire: vos information sont en attende de validation une fois traiter nous vous enverons un mail. puis une notification sera envoye a l'admin qui se chargeara de valider ou de refuser la structure si il refuse il doit justifier et apres la validation/refus on envera le mail au gestionnaire pour lui faire de la situation si accepter ou refuser(avec justification) tout le backend devra faire c'est etape a l'arriere et en se qui concerne la connexion du patient la connexion sera exiger si il veut donner un avis sur la plateforme il y'aura la connexion avec google et la creation de compte avec google donc si l'utilisateur clique su noter la plateforme un modal de connexion s'ouvrira et il pourra creer le compte avec google ou entre juste un email et un mot de passe je pense que c'est tout pour le coter utilisateur.