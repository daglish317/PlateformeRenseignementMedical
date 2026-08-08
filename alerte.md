SPÉCIFICATION FONCTIONNELLE
Module Alertes — Dashboard Pharmacie SantéProx
1. Objectif du module

Le module Alertes informe automatiquement les utilisateurs lorsqu'un événement nécessite une intervention.

Le système analyse en permanence les données de la pharmacie et génère des alertes selon des règles prédéfinies.

Une alerte ne peut jamais être créée manuellement par un utilisateur.

Toutes les alertes sont générées automatiquement par le système.

2. Principe métier

Le module Alertes ne modifie aucune donnée.

Il observe les autres modules et informe les utilisateurs lorsqu'une situation nécessite une action.

Les alertes sont alimentées par :

Approvisionnement
Stock
Vente
Caisse
Inventaire

Le module Alertes est uniquement un système de surveillance.

3. Les deux catégories d'alertes

Le système distingue deux catégories.

Alertes opérationnelles

Elles concernent le fonctionnement quotidien de la pharmacie.

Elles sont visibles par :

Gestionnaire
Propriétaire

Ces alertes nécessitent une intervention opérationnelle.

Alertes de supervision

Elles concernent le pilotage de la pharmacie.

Elles sont visibles uniquement par :

Propriétaire

Elles permettent d'identifier des situations inhabituelles ou nécessitant une analyse.

4. Permissions
Gestionnaire

Le gestionnaire peut :

consulter les alertes opérationnelles ;
rechercher une alerte ;
filtrer les alertes ;
marquer une alerte comme lue ;
accéder directement au module concerné.

Il ne peut pas :

supprimer une alerte ;
modifier une alerte ;
créer une alerte ;
consulter les alertes de supervision.
Propriétaire

Le propriétaire peut :

consulter toutes les alertes ;
rechercher une alerte ;
filtrer les alertes ;
marquer une alerte comme lue ;
accéder au module concerné ;
exporter les alertes si nécessaire.

Il ne peut pas :

modifier une alerte ;
supprimer une alerte ;
créer une alerte.
Caissier

Le caissier n'a aucun accès au module Alertes.

5. Alertes opérationnelles
Stock faible

Déclenchement

Le stock disponible devient inférieur ou égal au seuil d'alerte.

Exemple :

Paracétamol 500 mg

Stock disponible :
8

Seuil :
10

Action proposée :

Accéder au module Approvisionnement.

Rupture de stock

Déclenchement

Le stock disponible atteint zéro.

Exemple :

Amoxicilline 500 mg

Stock :
0

Action proposée :

Créer un nouvel approvisionnement.

6. Alertes de supervision

Ces alertes sont visibles uniquement par le propriétaire.

Nombre inhabituel de retours caisse

Le système détecte une augmentation anormale des retours caisse.

Exemple :

Aujourd'hui

18 retours caisse

Moyenne habituelle :
3

Le propriétaire peut alors analyser les causes.

Nombre inhabituel d'annulations de vente

Le système détecte un volume important de ventes annulées avant validation.

Cette alerte peut révéler :

une erreur de saisie récurrente ;
un problème d'organisation ;
une anomalie nécessitant un contrôle.
7. Structure de la page

La page est composée de quatre zones.

Zone 1 — Résumé

Le système affiche :

nombre total d'alertes ;
alertes critiques ;
alertes non lues ;
alertes résolues.
Zone 2 — Recherche

Recherche par :

médicament ;
type d'alerte ;
utilisateur concerné (propriétaire uniquement).
Zone 3 — Filtres

Filtres disponibles :

Toutes ;
Critiques ;
Non lues ;
Stock faible ;
Rupture ;
Supervision.
Zone 4 — Liste des alertes

Chaque alerte affiche :

niveau de priorité ;
titre ;
description ;
date ;
heure ;
bouton « Voir le module ».

Exemple :

🔴 Rupture de stock

Paracétamol 500 mg

Aujourd'hui - 09:45

[Voir Approvisionnement]
8. Priorité des alertes

Le système classe automatiquement les alertes.

Critique

Nécessite une intervention immédiate.

Exemple :

rupture de stock.
Moyenne

Une action est recommandée.

Exemple :

stock faible.
Information

Aucune action urgente.

Principalement utilisée pour certaines alertes de supervision.

9. Consultation d'une alerte

Lorsqu'un utilisateur ouvre une alerte, le système affiche :

la description complète ;
la date de création ;
le module concerné ;
les informations permettant de comprendre la situation.

Aucune modification n'est possible.

10. Marquage des alertes

Une alerte peut être :

non lue ;
lue.

Le marquage comme « lue » est propre à chaque utilisateur.

Par exemple :

un gestionnaire peut avoir lu une alerte ;
le propriétaire peut encore la voir comme non lue jusqu'à sa propre consultation.

Ainsi, chacun suit son propre état de lecture.

11. Interaction avec les autres modules

Le module Alertes ne crée aucune donnée métier.

Il reçoit automatiquement les informations des modules :

Approvisionnement ;
Stock ;
Vente ;
Caisse.

Chaque alerte contient un lien direct vers le module permettant de traiter le problème.

12. Sécurité

Les utilisateurs ne peuvent jamais :

créer une alerte ;
modifier une alerte ;
supprimer une alerte.

Les alertes sont exclusivement générées par le système selon des règles métier.

13. Règle fondamentale

Le module Alertes est un outil de surveillance, pas un outil de gestion.

Son rôle est de détecter automatiquement les situations nécessitant une intervention et d'orienter l'utilisateur vers le module approprié.

Il ne modifie jamais les données de la pharmacie et ne remplace pas les modules opérationnels. Il agit comme un système d'assistance intelligent pour garantir la continuité de l'activité et renforcer la supervision du propriétaire.