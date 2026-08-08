SPÉCIFICATION FONCTIONNELLE
Module Tableau de bord — Propriétaire de pharmacie — SantéProx
1. Objectif du module

Le tableau de bord est la première interface affichée après la connexion du propriétaire.

Son objectif est de fournir une vue globale, synthétique et en temps réel de l'état de la pharmacie.

Le propriétaire ne réalise aucune opération métier depuis cette page.

Le tableau de bord est exclusivement un outil de supervision et d'aide à la décision.

2. Principe métier

Le tableau de bord ne crée, ne modifie et ne supprime aucune donnée.

Toutes les informations affichées proviennent des autres modules de la pharmacie.

Le tableau de bord centralise ces informations afin d'offrir une vision globale de l'activité.

3. Permissions
Propriétaire

Le propriétaire peut :

consulter le tableau de bord ;
accéder aux modules concernés à partir des indicateurs affichés.

Il ne peut effectuer aucune opération métier depuis cette page.

Gestionnaire

Aucun accès.

Caissier

Aucun accès.

4. Structure générale

Le tableau de bord est composé de plusieurs sections indépendantes.

Chaque section peut être actualisée automatiquement.

5. Vue d'ensemble (Indicateurs principaux)

Cette section présente les indicateurs essentiels.

Le système affiche notamment :

Valeur actuelle du stock (calculée à partir du prix d'achat des produits disponibles)
Nombre total de références en stock
Nombre de produits en rupture
Nombre de produits en stock faible
Nombre de ventes en attente de validation caisse
Valeur financière des ventes en attente de validation

Cette section permet au propriétaire d'évaluer immédiatement l'état général de sa pharmacie.

6. Alertes prioritaires

Le tableau de bord affiche les alertes les plus importantes.

Exemples :

Ruptures de stock
Stocks faibles
Activités inhabituelles
Nombre anormal de retours caisse
Nombre anormal de ventes annulées

Chaque alerte est cliquable et redirige directement vers le module Alertes.

7. Activité du jour

Cette section résume l'activité quotidienne.

Le système affiche uniquement des compteurs.

Exemple :

Nombre d'approvisionnements enregistrés aujourd'hui
Nombre de ventes créées
Nombre de paiements validés
Nombre de retours caisse
Nombre d'inventaires générés

Les détails restent consultables dans les modules concernés.

8. État de la pharmacie

Cette section informe le propriétaire sur le fonctionnement général de son établissement.

Le système affiche notamment :

Nombre de gestionnaires actifs
Nombre de caissiers actifs
Date et heure du dernier approvisionnement enregistré
Date et heure du dernier inventaire généré

Cette vue permet de vérifier rapidement que les opérations essentielles sont bien réalisées.

9. Accès rapides

Le tableau de bord propose des raccourcis vers les principaux modules.

Accès disponibles :

Alertes
Statistiques
Historique
Approvisionnement
Inventaire

Chaque raccourci ouvre directement le module correspondant.

10. Actualisation des données

Le tableau de bord affiche des informations en temps réel.

Lorsqu'une opération est réalisée dans la pharmacie :

nouvel approvisionnement ;
validation d'une vente ;
retour caisse ;
inventaire ;

les indicateurs concernés sont automatiquement mis à jour.

Le propriétaire n'a pas besoin d'actualiser manuellement la page.

11. Interaction avec les autres modules

Le tableau de bord ne produit aucune donnée.

Il récupère automatiquement les informations provenant de :

Approvisionnement
Stock
Vente
Caisse
Inventaire
Alertes
Historique

Il agit comme un point central de consultation.

12. Sécurité

Le tableau de bord est accessible uniquement au propriétaire de la pharmacie.

Aucun autre rôle ne peut consulter les informations qu'il contient.

Les indicateurs financiers ne sont jamais affichés aux gestionnaires ni aux caissiers.

13. Performances

Le tableau de bord doit être optimisé pour afficher rapidement les informations essentielles.

Il ne charge jamais les listes complètes de ventes, de médicaments ou d'approvisionnements.

Seules les données nécessaires à la synthèse sont récupérées.

Les détails restent accessibles dans les modules spécialisés.

14. Règle fondamentale

Le tableau de bord est un outil de pilotage.

Il ne remplace aucun module métier.

Son rôle est de répondre immédiatement aux questions essentielles que se pose le propriétaire :

Ma pharmacie fonctionne-t-elle normalement ?
Y a-t-il des problèmes nécessitant une intervention ?
Mon stock est-il dans un état satisfaisant ?
Les opérations quotidiennes sont-elles correctement réalisées ?
Dois-je consulter un module spécifique ?

En moins de quelques secondes, le propriétaire doit pouvoir évaluer la situation globale de son établissement et accéder, si nécessaire, au module concerné pour obtenir davantage de détails. Cette approche garantit un tableau de bord clair, réactif et centré sur la prise de décision, sans surcharger l'utilisateur avec des informations opérationnelles.