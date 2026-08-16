Spécification fonctionnelle — Module Statistiques
1. Objectif

Le module Statistiques est un outil de pilotage du propriétaire.

Il permet d'analyser l'évolution de la pharmacie sur une période donnée à partir des données réelles enregistrées dans le système.

Il ne sert pas à effectuer des opérations.

Le propriétaire consulte les résultats ; il ne modifie aucune donnée depuis ce module.

2. Accès
PROPRIETAIRE

Accès complet en lecture :

consultation ;
recherche ;
filtrage ;
comparaison des périodes ;
consultation des détails statistiques ;
export des résultats.

GESTIONNAIRE

Aucun accès au module Statistiques.

Il dispose uniquement des informations opérationnelles nécessaires à son travail.

CAISSIER

Aucun accès au module Statistiques.

Il ne doit notamment jamais connaître :

les recettes de la journée ;
les recettes d'une période ;
le chiffre d'affaires ;
les bénéfices ;
la valeur financière globale de l'activité.
3. Principe de fonctionnement

Le propriétaire commence par sélectionner une période.

Périodes rapides :

Aujourd'hui ;
Hier ;
Cette semaine ;
Semaine précédente ;
Ce mois ;
Mois précédent ;
Cette année.

Il peut également sélectionner une période personnalisée.

Toutes les statistiques affichées sont recalculées selon cette période.

4. Vue générale

La première partie doit donner une vision synthétique de l'activité.

Elle peut afficher notamment :

Ventes
nombre de ventes validées ;
nombre de produits vendus ;
évolution par rapport à la période précédente.
Approvisionnements
nombre d'approvisionnements enregistrés ;
quantité totale de produits reçus ;
évolution des approvisionnements.
Stock
valeur actuelle du stock ;
nombre de références disponibles ;
nombre de ruptures ;
nombre de références sous le seuil.
Caisse
nombre de paiements validés ;
nombre de retours caisse ;
nombre d'annulations avant paiement.

Les montants financiers détaillés restent exclusivement accessibles au propriétaire.

5. Analyse des ventes

Le propriétaire peut analyser l'activité commerciale.

Le système permet notamment de voir :

évolution du nombre de ventes ;
évolution du nombre de produits vendus ;
périodes avec la plus forte activité ;
périodes avec la plus faible activité.

L'analyse doit pouvoir être présentée graphiquement.

Exemple :

Ventes
│
│             █
│       █     █
│   █   █  █  █
│___█___█__█__█____
   Lun Mar Mer Jeu

Le graphique doit rester lisible et ne pas transformer la page en tableau de données massif.

6. Produits les plus vendus

Le système classe les produits selon les quantités réellement vendues.

Exemple :

Produit	Quantité vendue
Paracétamol	450
Amoxicilline	280
Doliprane	210

Le propriétaire peut identifier les produits qui génèrent le plus de mouvement.

Cette information peut ensuite l'aider à prendre des décisions d'approvisionnement.

7. Produits les moins vendus

Même logique dans l'autre sens.

Le système identifie les produits ayant enregistré le moins de ventes sur la période.

Attention : cela ne signifie pas automatiquement que ces produits sont inutiles.

La statistique indique simplement leur faible rotation.

La décision appartient au propriétaire.

8. Analyse des approvisionnements

Le propriétaire peut voir :

nombre d'approvisionnements ;
quantité totale reçue ;
évolution des approvisionnements ;
périodes de forte réception.

Le système peut également permettre d'identifier les produits qui nécessitent fréquemment un réapprovisionnement.

9. Analyse du stock

Cette partie est importante.

Le propriétaire peut suivre :

nombre de références disponibles ;
nombre de ruptures ;
nombre de stocks faibles ;
évolution des ruptures ;
produits connaissant le plus de ruptures.

Cela permet de comparer les mouvements du stock avec les ventes et les approvisionnements.

10. Analyse des retours caisse

Le propriétaire peut consulter :

nombre de retours caisse ;
évolution des retours ;
fréquence des retours sur une période.

L'objectif n'est pas d'accuser un utilisateur.

Cette statistique sert à détecter une situation inhabituelle nécessitant éventuellement une analyse.

11. Analyse des annulations

Le système peut également présenter le nombre de ventes annulées avant validation du paiement, conformément au workflow de caisse que nous avons défini.

Le propriétaire peut observer leur évolution.

Cela permet notamment de détecter :

des erreurs fréquentes ;
des problèmes dans le processus de vente ;
une activité inhabituelle.

Encore une fois, la statistique ne constitue pas une accusation.

12. Analyse financière

Cette partie est strictement réservée au propriétaire.

Elle peut présenter les informations financières issues des ventes effectivement validées par la caisse.

Point essentiel :

Une vente créée par le gestionnaire mais refusée ou annulée par la caisse ne doit pas être considérée comme une vente encaissée.

Le système doit donc distinguer clairement :

Vente préparée
      ↓
Caisse
      ↓
VALIDÉE ───────→ opération encaissée
ANNULÉE ───────→ aucune recette

Les statistiques financières doivent se baser sur les paiements réellement validés.

13. Valeur du stock

Le propriétaire peut consulter la valeur de son stock.

Il faut distinguer :

Valeur d'achat

Somme correspondant au coût d'acquisition des produits encore présents en stock.

Valeur potentielle de vente

Valeur calculée à partir des prix de vente enregistrés.

Ces deux valeurs ne doivent pas être confondues.

Le propriétaire peut ainsi comparer :

Valeur d'achat du stock
        ↓
Valeur potentielle de vente

Cela lui donne une vision économique de son stock.

14. Comparaison des périodes

Le propriétaire doit pouvoir comparer deux périodes.

Exemple :

Juillet 2026
vs
Juin 2026

Le système peut afficher :

évolution des ventes ;
évolution des approvisionnements ;
évolution des ruptures ;
évolution des retours caisse.

Avec une variation en pourcentage.

Exemple :

Ventes

Juin : 1 240
Juillet : 1 480

+19,35 %
15. Filtres

Les statistiques doivent pouvoir être filtrées selon les besoins.

Filtres possibles :

période ;
produit ;
catégorie/type de produit ;
approvisionnement ;
vente ;
caisse.

Il faut éviter de multiplier inutilement les filtres.

L'objectif reste de permettre une analyse rapide.

16. Export

Le propriétaire peut exporter les statistiques correspondant aux filtres actuellement sélectionnés.

Formats :

Excel pour l'analyse des données ;
PDF pour la consultation ou l'archivage.

L'export doit reprendre la période et les filtres utilisés.

17. Sécurité

C'est un point majeur.

Le module Statistiques ne doit jamais simplement cacher les informations financières dans l'interface.

L'autorisation doit être contrôlée au niveau du système.

Ainsi :

PROPRIETAIRE
      ↓
Statistiques
      ↓
Données complètes

alors que :

GESTIONNAIRE
      ↓
Accès refusé

et :

CAISSIER
      ↓
Accès refusé

Un gestionnaire ne doit pas pouvoir récupérer les statistiques financières en contournant l'interface.

18. Les statistiques ne doivent jamais modifier les données

Depuis Statistiques, aucune action permettant de modifier :

stock ;
vente ;
approvisionnement ;
caisse ;
inventaire

ne doit être disponible.

Les statistiques sont strictement en lecture.

19. Différence définitive avec le Tableau de bord

Nous devons conserver cette séparation.

Tableau de bord

Répond :

Que se passe-t-il actuellement ?

Il présente les indicateurs importants immédiatement.

Statistiques

Répond :

Comment l'activité évolue-t-elle ?

Il permet :

d'analyser ;
de comparer ;
d'observer les tendances ;
d'exporter.

Ainsi, nous évitons de transformer le tableau de bord en une page remplie de graphiques.

20. Règle fondamentale

Le module Statistiques doit être considéré comme la couche d'analyse du système.

Il ne crée aucune donnée et ne décide rien à la place du propriétaire.

Il transforme les données opérationnelles déjà enregistrées dans SantéProx en informations permettant au propriétaire de comprendre :

l'activité commerciale ;
les mouvements du stock ;
les approvisionnements ;
les ruptures ;
les retours ;
les annulations ;
et, exclusivement pour lui, les informations financières.

Avec cela, les modules principaux de gestion de la pharmacie sont maintenant définis : Approvisionnement, Vente, Caisse, Inventaire, Historique, Alertes, Tableau de bord et Statistiques.