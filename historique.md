SPÉCIFICATION FONCTIONNELLE
Module Historique — Dashboard Gestionnaire Pharmacie SantéProx
1. Objectif du module

Le module Historique permet de consulter les principaux événements ayant marqué la gestion de la pharmacie.

Il constitue un journal chronologique des opérations importantes réalisées dans la structure.

Son objectif est de :

garantir la traçabilité des opérations importantes ;
permettre au propriétaire de contrôler la gestion de sa pharmacie ;
permettre au gestionnaire de retrouver rapidement un événement important ;
faciliter les audits et les recherches.

Le module Historique ne permet aucune modification.

2. Principe métier

Le module Historique n'enregistre pas toutes les opérations effectuées dans la pharmacie.

Les opérations courantes restent consultables dans leurs modules respectifs.

Exemple :

les ventes restent dans le module Vente ;
les paiements restent dans le module Caisse ;
les approvisionnements restent dans le module Approvisionnement.

L'Historique conserve uniquement les événements majeurs.

3. Gestion des permissions
Gestionnaire

Le gestionnaire peut :

consulter l'historique de sa pharmacie ;
rechercher un événement ;
filtrer les événements ;
consulter les détails d'un événement.

Il ne peut pas :

modifier un événement ;
supprimer un événement ;
masquer un événement ;
exporter l'historique complet.
Propriétaire

Le propriétaire dispose d'un accès complet en lecture.

Il peut :

consulter tous les événements ;
effectuer des recherches ;
appliquer des filtres ;
exporter l'historique ;
consulter les détails complets d'un événement.

Il ne peut pas :

modifier un événement ;
supprimer un événement.

Le propriétaire supervise, il n'intervient pas sur les données enregistrées.

Caissier

Le caissier n'a aucun accès au module Historique.

Toutes les informations nécessaires à son activité sont disponibles dans son propre espace de travail.

4. Structure générale de la page

La page est composée de quatre zones.

Zone 1 — Résumé

Le système affiche des indicateurs permettant d'avoir une vue rapide de l'activité.

Exemples :

Nombre d'événements aujourd'hui.
Nombre d'approvisionnements.
Nombre de retours caisse.
Nombre d'inventaires générés.

Ces indicateurs sont uniquement informatifs.

Zone 2 — Recherche

Une barre de recherche permet de retrouver rapidement un événement.

La recherche peut porter sur :

le type d'événement ;
le nom d'un médicament ;
le numéro d'un approvisionnement ;
le numéro d'une facture concernée (pour un retour caisse) ;
le nom de l'utilisateur ayant réalisé l'action.
Zone 3 — Filtres

Le gestionnaire peut filtrer l'historique selon :

Aujourd'hui ;
Cette semaine ;
Ce mois ;
Période personnalisée.

Il peut également filtrer par type d'événement.

Zone 4 — Liste chronologique

Les événements sont affichés du plus récent au plus ancien.

Chaque ligne présente un résumé.

Exemple :

06/08/2026 - 09:35

Approvisionnement enregistré

Paul N.

125 produits
5. Événements enregistrés

Le module enregistre uniquement les événements importants.

Approvisionnement
Création d'un approvisionnement.
Inventaire
Génération d'un inventaire.
Caisse
Retour caisse.

Le retour caisse est enregistré car il réintroduit des produits dans le stock après une vente déjà finalisée.

Autres événements futurs

Le système pourra accueillir de nouveaux événements métier sans modifier la structure du module.

6. Événements volontairement exclus

Les événements suivants ne sont pas affichés dans l'Historique.

Vente

Chaque vente est consultable dans le module Vente.

Paiement

Chaque paiement est consultable dans le module Caisse.

Impression d'un reçu

Consultable dans le module Caisse.

Recherche d'un médicament

Non enregistrée.

Consultation d'un inventaire

Non enregistrée.

7. Consultation d'un événement

En sélectionnant un événement, le système ouvre une fiche détaillée.

Selon le type d'événement, la fiche affiche les informations pertinentes.

Exemple pour un approvisionnement :

numéro de l'approvisionnement ;
date et heure ;
utilisateur ayant réalisé l'opération ;
nombre de produits ;
liste des médicaments concernés.

Exemple pour un retour caisse :

numéro de facture ;
utilisateur ayant validé le retour ;
date ;
médicaments réintégrés ;
quantités réintégrées.
8. Export

Seul le propriétaire peut exporter l'historique.

Formats prévus :

PDF ;
Excel.

Le gestionnaire ne dispose pas de cette fonctionnalité.

9. Sécurité

Aucun événement ne peut être :

modifié ;
supprimé ;
renommé.

Chaque événement devient une trace permanente.

10. Interaction avec les autres modules

Le module Historique reçoit automatiquement les événements générés par :

Approvisionnement ;
Inventaire ;
Caisse (retour caisse).

Il ne crée lui-même aucun événement.

11. Traçabilité

Pour chaque événement, le système enregistre automatiquement :

identifiant unique ;
type d'événement ;
structure concernée ;
utilisateur ayant réalisé l'action ;
rôle de l'utilisateur ;
date ;
heure.

Ces informations sont enregistrées automatiquement et ne peuvent pas être modifiées.

12. Règle fondamentale

Le module Historique est un journal de traçabilité, et non un journal exhaustif de toutes les opérations quotidiennes.

Les événements courants restent consultables dans leurs modules dédiés.

L'Historique conserve uniquement les événements métier importants afin de garantir une interface claire, exploitable et adaptée à une pharmacie réalisant un volume élevé d'opérations. Cette approche évite les doublons, améliore la lisibilité et permet au propriétaire de retrouver rapidement les informations qui comptent réellement.