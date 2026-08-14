Spécification fonctionnelle — Branchement du module Pharmacie au moteur de recherche public
1. Objectif

Le moteur de recherche public doit permettre à un utilisateur de rechercher un médicament et d'identifier rapidement les pharmacies actuellement ouvertes, géographiquement pertinentes et disposant réellement du produit recherché.

Le moteur doit être :

rapide ;
fiable ;
insensible à la casse ;
intelligent dans les suggestions ;
cohérent avec les stocks réels ;
cohérent avec les horaires officiels des pharmacies ;
capable de fonctionner avec la géolocalisation ;
capable de charger les résultats progressivement ;
synchronisé avec la carte.

Le moteur public ne doit jamais exposer les données internes de gestion de la pharmacie qui ne sont pas destinées au public.

2. Principe fondamental

Une pharmacie n'est éligible à une recherche publique que si toutes les conditions nécessaires sont satisfaites.

Produit correspondant
        ↓
Produit disponible en stock
        ↓
Produit non expiré
        ↓
Pharmacie active
        ↓
Pharmacie actuellement ouverte
        ↓
Localisation exploitable
        ↓
Pharmacie éligible

Une pharmacie fermée ne doit pas être retournée dans les résultats, même si elle possède le médicament.

3. Source de vérité

Le moteur ne doit pas reconstruire lui-même les données métier.

Pour le stock

La source de vérité est le stock actuel de la pharmacie.

Le moteur ne doit pas recalculer le stock à partir :

des approvisionnements ;
des ventes ;
des annulations ;
des retours ;
des inventaires.

Ces opérations modifient le stock dans le système de gestion, et le moteur utilise ensuite l'état résultant.

Pour les horaires

La source de vérité est l'horaire officiel enregistré pour la pharmacie.

Le moteur détermine l'état :

OUVERTE

ou

FERMÉE

à partir de :

la date actuelle ;
l'heure actuelle ;
le jour concerné ;
les plages horaires enregistrées ;
le fuseau horaire applicable.
4. Recherche insensible à la casse

La recherche doit être totalement indépendante de la casse.

Les saisies suivantes doivent être équivalentes :

PARACETAMOL
Paracetamol
paracetamol
PaRaCeTaMoL

Le moteur doit normaliser la saisie avant d'effectuer la recherche.

La casse ne doit jamais empêcher de retrouver un produit existant.

5. Recherche partielle et intelligente

Le moteur doit être capable d'exploiter une saisie partielle.

Exemple :

para

Le système peut proposer :

Paracétamol
Paracétamol 500 mg
Paracétamol sirop

Les suggestions doivent provenir des données réellement présentes dans le système.

Le moteur ne doit pas inventer de médicaments.

6. Suggestions pendant la saisie

La recherche doit être dynamique.

Workflow :

Utilisateur clique dans la recherche
        ↓
Affichage de l'historique
        ↓
Utilisateur commence à écrire
        ↓
L'historique laisse place aux suggestions
        ↓
Les suggestions évoluent avec la saisie
        ↓
Utilisateur sélectionne une suggestion
        ↓
Recherche

La recherche doit rester fluide même lorsque l'utilisateur tape rapidement.

Les appels inutiles au serveur doivent être limités afin de préserver les performances.

7. Historique des recherches

Le moteur doit conserver les 10 dernières recherches de l'utilisateur.

Règles
maximum 10 recherches ;
la recherche la plus récente apparaît en premier ;
les doublons inutiles doivent être évités ;
une recherche précédente peut être sélectionnée pour être relancée ;
lorsque la limite est dépassée, la plus ancienne recherche est supprimée.

L'historique ne constitue pas le catalogue de médicaments.

Il s'agit uniquement d'une aide à la recherche pour l'utilisateur.

8. Validation d'une recherche

Une recherche peut être lancée :

en sélectionnant une suggestion ;
en sélectionnant une recherche historique ;
en validant directement le texte saisi.

Le moteur doit traiter la recherche même si l'utilisateur ne sélectionne aucune suggestion, à condition que la saisie soit exploitable.

9. Recherche du médicament

Une fois la recherche validée :

Recherche utilisateur
        ↓
Normalisation
        ↓
Correspondance avec les produits existants
        ↓
Identification des stocks correspondants

Le moteur doit identifier les produits correspondant réellement à la recherche.

Il doit respecter les relations existantes dans le système et ne doit pas inventer de correspondances médicales.

10. Vérification du stock

Pour chaque pharmacie correspondant au médicament, le moteur doit vérifier le stock actuel.

Stock disponible
quantité > 0

Le produit peut être considéré comme disponible.

Stock nul
quantité = 0

La pharmacie doit être exclue du résultat pour cette recherche.

11. Produits expirés

Un médicament arrivé à expiration ne doit jamais être considéré comme disponible pour le moteur public.

Même si :

quantité > 0

le produit doit être exclu s'il est expiré.

Le moteur doit donc tenir compte de la date de péremption lorsqu'il détermine la disponibilité publique.

12. Vérification de l'ouverture

Après vérification du produit et du stock, le moteur doit vérifier les horaires de la pharmacie.

Produit disponible
        +
Pharmacie ouverte
        ↓
Pharmacie éligible

Si la pharmacie est fermée :

Produit disponible
        +
Pharmacie fermée
        ↓
Pharmacie exclue

Il n'est pas nécessaire d'afficher à l'utilisateur une pharmacie fermée dans les résultats courants.

13. Gestion des horaires multiples

Le modèle d'horaire doit permettre plusieurs périodes dans une même journée.

Exemple :

Lundi

08:00 → 13:00
15:00 → 20:00

À 12h00 :

OUVERTE

À 14h00 :

FERMÉE

À 16h00 :

OUVERTE

Le moteur doit déterminer automatiquement l'état actuel.

14. Exemple complet de filtrage

Supposons que la recherche soit :

Paracétamol

Le système trouve :

Pharmacie	Stock	Expiré	Ouverte	Résultat
Pharmacie A	20	Non	Oui	✅
Pharmacie B	50	Non	Non	❌
Pharmacie C	0	Non	Oui	❌
Pharmacie D	10	Oui	Oui	❌
Pharmacie E	8	Non	Oui	✅

Le moteur retourne uniquement :

Pharmacie A
Pharmacie E
15. Géolocalisation

Une fois les pharmacies éligibles identifiées, le moteur exploite la position de l'utilisateur.

Il doit pouvoir déterminer :

distance ;
temps estimé à pied ;
temps estimé en voiture.

Les pharmacies doivent être classées selon leur pertinence géographique.

Les plus proches doivent être privilégiées.

16. Résultats de recherche

Chaque résultat doit afficher au minimum :

Structure
photo ;
nom de la pharmacie ;
localisation.
Produit
nom du produit correspondant ;
quantité actuellement disponible.
Géolocalisation
distance ;
temps estimé à pied ;
temps estimé en voiture.
Action
bouton Voir le détail.

Exemple :

┌──────────────────────────────────────┐
│ [Photo]                              │
│                                      │
│ Pharmacie Centrale                   │
│                                      │
│ Paracétamol 500 mg                   │
│ Stock disponible : 24                │
│ouvert/fermé                          │
│ 1,2 km                               │
│ 15 min à pied                        │
│ 5 min en voiture                     │
│                                      │
│ [Voir le détail]                     │
└──────────────────────────────────────┘
17. Quantité affichée au public

La quantité réellement disponible peut être affichée dans le résultat conformément à la décision retenue.

Exemple :

Stock disponible : 24

Cette information doit cependant représenter l'état du stock au moment où le résultat est généré.

Le système ne doit pas présenter cette valeur comme une réservation garantie.

18. Pagination des résultats

Le moteur ne doit jamais retourner toutes les pharmacies correspondantes en une seule réponse.

Les résultats doivent être paginés.

Exemple :

Première réponse
→ résultats 1 à 20

Utilisateur descend
→ résultats 21 à 40

Utilisateur descend
→ résultats 41 à 60

Le frontend peut présenter cela sous forme de scroll infini.

L'utilisateur ne doit pas avoir besoin de cliquer manuellement sur « page suivante ».

19. Chargement progressif

Lorsque l'utilisateur approche de la fin des résultats actuellement chargés :

Résultats disponibles
        ↓
Utilisateur fait défiler
        ↓
Seuil atteint
        ↓
Chargement du prochain lot
        ↓
Ajout aux résultats existants

Les résultats déjà affichés ne doivent pas disparaître pendant le chargement suivant.

20. Carte

La carte doit être synchronisée avec la recherche.

Elle doit afficher les pharmacies éligibles autour de l'utilisateur.

Une pharmacie fermée ne doit pas apparaître sur la carte comme résultat de la recherche.

La carte et la liste doivent donc utiliser le même ensemble de données filtrées.

21. Déplacement de l'utilisateur

Le système doit surveiller la position de l'utilisateur lorsque celui-ci a autorisé la géolocalisation.

Lorsque sa position évolue suffisamment :

Nouvelle position
        ↓
Nouvelle zone pertinente
        ↓
Recherche des pharmacies éligibles
        ↓
Mise à jour de la carte
        ↓
Mise à jour des résultats si nécessaire

Le système ne doit pas déclencher une recherche complète à chaque variation minime du GPS.

Il doit appliquer une stratégie de mise à jour contrôlée afin de limiter :

les requêtes ;
la consommation réseau ;
la consommation de batterie ;
la charge serveur.
22. Nouvelles pharmacies apparaissant pendant le déplacement

Exemple :

Position initiale
        ↓
Pharmacies A, B, C

L'utilisateur se déplace :

Nouvelle position
        ↓
Pharmacies A, B, C, D, E

Les nouvelles structures pertinentes doivent pouvoir apparaître progressivement.

Inversement, une structure qui n'est plus pertinente peut sortir de la zone de résultats.

23. Sélection d'une pharmacie sur la carte

Lorsqu'un utilisateur sélectionne un marqueur :

Utilisateur
      ↓
Sélection du marqueur
      ↓
Pharmacie sélectionnée
      ↓
Affichage des informations pertinentes

Le système doit permettre d'accéder à la fiche de la pharmacie.

24. Itinéraire vers la pharmacie

L'utilisateur doit pouvoir demander un itinéraire vers la pharmacie sélectionnée.

Le système doit calculer un itinéraire praticable entre :

Position utilisateur
        ↓
Pharmacie

Le système doit privilégier le trajet réellement praticable le plus pertinent, et non simplement tracer une ligne droite entre deux coordonnées.

25. Suivi de l'itinéraire

Pendant le déplacement, la position de l'utilisateur est actualisée.

Si l'utilisateur se rapproche :

Utilisateur ─────── Pharmacie

la distance restante diminue.

S'il s'éloigne :

Utilisateur ───────────────── Pharmacie

la distance restante augmente.

Le système doit refléter la position GPS réelle.

26. Recalcul d'itinéraire

Si l'utilisateur quitte fortement l'itinéraire calculé ou si le trajet optimal change de manière significative, le système doit pouvoir recalculer l'itinéraire.

Le recalcul ne doit pas être déclenché inutilement à chaque mise à jour de position.

27. Fiche publique de la pharmacie

Le bouton :

Voir le détail

ouvre une page publique dédiée à la pharmacie.

Cette page doit présenter les informations publiques de la structure.

Elle doit notamment contenir :

photo ;
nom ;
localisation ;
informations publiques ;
horaires ;
produits disponibles.
28. Horaires dans la fiche

La fiche doit présenter les horaires complets.

Exemple :

Horaires

Lundi       08:00 — 20:00
Mardi       08:00 — 20:00
Mercredi    08:00 — 20:00
Jeudi       08:00 — 20:00
Vendredi    08:00 — 20:00
Samedi      08:00 — 18:00
Dimanche    Fermé

Les horaires affichés doivent provenir de la même source que celle utilisée par le moteur pour déterminer l'ouverture.

Il ne doit pas exister une version différente des horaires pour la fiche et pour le moteur.

29. Recherche dans une pharmacie

La fiche pharmacie doit disposer d'une recherche interne.

Exemple :

Pharmacie Centrale

[ Rechercher un médicament ]

Paracétamol

Cette recherche est limitée aux produits de cette pharmacie.

Elle ne doit pas effectuer une recherche globale.

Le système doit continuer à appliquer les règles de disponibilité.

30. Données internes interdites au moteur public

Le moteur public ne doit pas exposer :

prix d'achat ;
fournisseurs ;
approvisionnements ;
factures internes ;
recettes ;
informations de caisse ;
informations des gestionnaires ;
permissions ;
historique administratif ;
données réservées au propriétaire ;
données de traçabilité interne.

La recherche publique doit utiliser uniquement les données nécessaires à l'expérience utilisateur.

31. Cohérence avec les opérations de la pharmacie

Le moteur doit automatiquement refléter les changements produits par :

Approvisionnement
Approvisionnement validé
        ↓
Stock augmente
        ↓
Moteur peut voir le nouveau stock
Vente validée par la caisse
Vente validée
        ↓
Stock diminue
        ↓
Moteur voit le nouveau stock
Vente annulée
Vente annulée
        ↓
Stock restauré
        ↓
Moteur voit le stock restauré
Retour en caisse
Retour validé
        ↓
Stock réajusté selon le workflow
        ↓
Moteur reflète l'état réel

Le moteur ne doit pas reproduire ces mécanismes. Le stock reste la source de vérité.

32. Gestion des changements d'horaires

Lorsque les horaires officiels d'une pharmacie sont modifiés dans son système de gestion :

Modification horaire
        ↓
Nouvelle donnée officielle
        ↓
Moteur utilise cette donnée
        ↓
Éligibilité recalculée

Ainsi, une pharmacie peut automatiquement disparaître des résultats lorsqu'elle ferme et réapparaître lorsqu'elle ouvre.

33. Performance

La rapidité est une exigence fonctionnelle majeure.

Le moteur ne doit pas fonctionner comme ceci :

Toutes les pharmacies
        ↓
Tous les stocks
        ↓
Tout envoyer au frontend
        ↓
Filtrage JavaScript

Cette approche serait mauvaise.

Les filtres importants doivent être effectués côté serveur/base de données autant que possible :

Recherche
   ↓
Filtrage
   ↓
Stock
   ↓
Expiration
   ↓
Horaires
   ↓
Géographie
   ↓
Pagination
   ↓
Résultats

Le frontend ne reçoit que les données nécessaires.

34. Fiabilité

Le moteur ne doit jamais inventer :

un médicament ;
une pharmacie ;
une quantité ;
une disponibilité ;
un horaire ;
une distance ;
un temps de trajet.

Toutes les informations doivent provenir de sources définies dans le système.

En cas d'information indispensable indisponible, le moteur doit adopter un comportement déterministe plutôt que d'inventer une valeur.

35. Architecture fonctionnelle finale

Le branchement peut être représenté ainsi :

                    ┌─────────────────────┐
                    │   DONNÉES PHARMACIE │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
          Produits           Stocks            Horaires
             │                 │                  │
             │                 │                  │
             └─────────────────┼──────────────────┘
                               ▼
                     MOTEUR DE RECHERCHE
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
              ▼                ▼                 ▼
          Recherche         Disponibilité     Ouverture
              │                │                 │
              └────────────────┼─────────────────┘
                               ▼
                      Pharmacies éligibles
                               │
                               ▼
                         Géolocalisation
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
                 Résultats              Carte
                 paginés               dynamique
                    │                     │
                    └──────────┬──────────┘
                               ▼
                      Fiche pharmacie
                               │
                               ▼
                     Recherche locale
36. Règle centrale à retenir

Le moteur public ne cherche finalement pas simplement :

« Quelles pharmacies possèdent ce médicament ? »

Il répond à une question beaucoup plus précise :

« Quelles pharmacies actuellement ouvertes, proches de l'utilisateur, disposent réellement et actuellement du médicament recherché ? »

C'est cette définition qui doit guider l'implémentation.

37. Périmètre de cette spécification

Cette spécification concerne uniquement le branchement du module Pharmacie avec le moteur de recherche public.

Elle ne modifie pas :

le workflow d'approvisionnement ;
le workflow de vente ;
la caisse ;
l'inventaire ;
les statistiques ;
les alertes ;
les permissions du dashboard ;
le fonctionnement interne des gestionnaires.

Ces modules restent les sources de données métier du moteur.