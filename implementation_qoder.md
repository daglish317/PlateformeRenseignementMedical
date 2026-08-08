SPÉCIFICATION FONCTIONNELLE
Module Inventaire — Dashboard Gestionnaire Pharmacie SantéProx
1. Objectif du module

Le module Inventaire permet au gestionnaire d'une pharmacie de produire un état complet du stock actuel de son établissement.

Cet état représente une photographie des données du stock à un moment précis.

L'objectif est de permettre :

au gestionnaire de contrôler l'état des médicaments disponibles ;
au propriétaire de suivre l'évolution du stock ;
au système de conserver une traçabilité des états générés.

Le module ne réalise aucune opération de gestion du stock.

2. Principe métier

L'inventaire est un document généré à partir des données existantes du système.

Il récupère automatiquement les informations provenant des modules :

Approvisionnement ;
Vente ;
Caisse.

Il ne crée aucun mouvement.

Il ne modifie aucune quantité.

Il ne supprime aucun médicament.

3. Rôle du module dans le système

Le module Inventaire répond à la question :

"Quel était l'état du stock de cette pharmacie à un moment donné ?"

Exemple :

Le gestionnaire génère un inventaire le 06/08/2026 à 10h30.

Le système capture :

Médicament : Paracétamol
Quantité disponible : 250
Quantité réservée : 10
Statut : Disponible

Cet état reste consultable même si le stock change ensuite.

4. Gestion des permissions
4.1 Gestionnaire de pharmacie

Le gestionnaire est responsable de la production des inventaires.

Il peut :

accéder au module Inventaire ;
générer un nouvel inventaire ;
consulter les inventaires générés par sa structure ;
rechercher un médicament dans un inventaire ;
filtrer les résultats ;
exporter un inventaire selon les permissions définies.

Il ne peut pas :

modifier un inventaire existant ;
supprimer un inventaire ;
modifier le stock ;
modifier les informations d'un médicament depuis ce module.
4.2 Propriétaire de pharmacie

Le propriétaire possède un rôle de supervision.

Il peut :

consulter les inventaires générés ;
consulter l'état actuel du stock ;
consulter les anciens inventaires ;
télécharger les rapports disponibles.

Il ne peut pas :

modifier un inventaire ;
supprimer un inventaire ;
modifier directement le stock.

Son rôle est de contrôler, pas d'opérer.

4.3 Caissier

Le caissier n'a aucun accès au module Inventaire.

Raison :

Son rôle concerne uniquement :

la réception des paiements ;
la validation des ventes ;
l'impression des reçus.

Il n'intervient pas dans la gestion du stock.

5. Workflow général
Étape 1 — Demande de création

Le gestionnaire ouvre le module.

Il sélectionne :

Générer un inventaire

Étape 2 — Capture des données

Le système récupère automatiquement :

liste des médicaments existants ;
quantité physique disponible ;
quantité réservée ;
quantité réellement disponible à la vente ;
seuil d'alerte ;
statut du stock.
Étape 3 — Génération

Le système crée un inventaire.

Il enregistre :

identifiant unique ;
structure concernée ;
utilisateur ayant généré l'inventaire ;
rôle de l'utilisateur ;
date ;
heure.
Étape 4 — Consultation

Le gestionnaire peut consulter immédiatement le résultat.

Le propriétaire pourra également le consulter depuis son espace.

6. Contenu d'un inventaire

Un inventaire contient deux niveaux d'information.

Niveau 1 : Résumé général

Informations affichées :

date de génération ;
pharmacie concernée ;
utilisateur ayant généré l'inventaire ;
nombre total de produits ;
nombre de produits disponibles ;
nombre de produits en rupture ;
nombre de produits en stock faible.
Niveau 2 : Détail des produits

Chaque ligne représente un médicament.

Informations :

nom du médicament ;
forme pharmaceutique ;
quantité physique ;
quantité réservée ;
quantité disponible ;
seuil d'alerte ;
statut.
7. Statuts du stock

Le système calcule automatiquement le statut.

Disponible

Lorsque la quantité disponible est supérieure au seuil.

Stock faible

Lorsque la quantité disponible atteint le seuil d'alerte.

Rupture

Lorsque la quantité disponible est égale à zéro.

8. Recherche et filtres

Le gestionnaire peut rechercher dans un inventaire.

Recherche par :

nom du médicament ;
forme pharmaceutique ;
statut.

Filtres disponibles :

Tous les produits ;
Disponible ;
Stock faible ;
Rupture.
9. Historique des inventaires

Chaque inventaire généré est conservé.

Le système garde :

date de création ;
utilisateur créateur ;
nombre de produits ;
état du stock au moment de la génération.

Un inventaire historique ne change jamais.

Même si le stock actuel évolue, l'ancien inventaire reste identique.

10. Export

Le système peut permettre l'export d'un inventaire.

Formats possibles :

PDF ;
Excel.

L'export contient uniquement les informations autorisées selon le rôle.

11. Sécurité et traçabilité

Chaque génération d'inventaire est enregistrée.

Le système conserve :

utilisateur ;
date ;
heure ;
pharmacie concernée.

Aucune suppression silencieuse n'est autorisée.

Un inventaire généré devient un document historique.

12. Interaction avec les autres modules
Approvisionnement

Fournit les entrées de stock.

Vente

Fournit les réservations et sorties prévues.

Caisse

Détermine si une vente devient définitive ou est annulée.

Historique

Permet de retrouver les événements ayant conduit à l'évolution du stock.

13. Règle fondamentale du module

L'inventaire observe le stock, il ne le contrôle pas et il ne le modifie pas.

Toute modification du stock doit obligatoirement passer par un flux métier :

Approvisionnement ;
Vente validée ;
Retour en caisse.