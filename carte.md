1. La recherche doit alimenter la carte

Lorsqu'un utilisateur recherche un médicament, par exemple :

Paracétamol

le moteur de recherche doit retourner uniquement les pharmacies qui :

sont ouvertes au moment de la recherche ;
possèdent le médicament recherché ;
ont une quantité disponible conforme aux données du stock ;
peuvent être géolocalisées.

Ces pharmacies doivent simultanément être représentées sur la carte.

Recherche "Paracétamol"
        │
        ├── Résultats
        │      ├── Pharmacie A
        │      ├── Pharmacie B
        │      └── Pharmacie C
        │
        └── Carte
               ├── 📍 A
               ├── 📍 B
               └── 📍 C

C'est le même jeu de résultats.

La carte ne doit pas afficher une liste indépendante qui ne correspond pas aux résultats.

2. Les pharmacies doivent apparaître comme marqueurs

Chaque pharmacie correspondant à la recherche doit avoir un marqueur sur la carte.

Le marqueur doit être positionné à partir des coordonnées GPS réelles de la structure.

Il ne faut donc pas :

positionner les pharmacies approximativement ;
utiliser une adresse textuelle comme position si des coordonnées GPS existent ;
afficher un marqueur sans pharmacie correspondante.
3. Les résultats paginés ne doivent pas casser la carte

Nous avions décidé que les résultats doivent être paginés / chargés progressivement.

Il faut donc distinguer :

Résultats actuellement chargés

Ils sont affichés immédiatement.

Résultats supplémentaires

Ils sont chargés progressivement lorsque l'utilisateur fait défiler les résultats.

La carte doit pouvoir être synchronisée avec les résultats chargés sans devoir charger toute la base de pharmacies.

Mais il y a une nuance importante :

Si nous voulons que la carte affiche toutes les pharmacies pertinentes autour de l'utilisateur, indépendamment de la page actuellement visible, l'API doit fournir au frontend les données géographiques nécessaires séparément des données détaillées des cartes de résultats.

C'est donc un point à vérifier dans l'implémentation actuelle.

4. La position de l'utilisateur

La carte doit récupérer la position géographique de l'utilisateur lorsqu'il autorise la géolocalisation.

Elle doit afficher sa position :

       📍 Pharmacie
           
          🔵
       Utilisateur

La position utilisateur constitue la référence pour :

calculer les distances ;
calculer les temps de trajet ;
classer les pharmacies ;
dessiner l'itinéraire.
5. Classement des pharmacies

Les pharmacies doivent être classées en fonction de leur proximité par rapport à l'utilisateur, conformément à la logique que nous avons définie.

Exemple :

Utilisateur
    │
    ├── Pharmacie A — 0,8 km
    ├── Pharmacie B — 1,2 km
    └── Pharmacie C — 2,4 km

Le premier résultat doit donc correspondre à une pharmacie proche, sous réserve qu'elle remplisse les autres critères de recherche.

6. Sélection d'une pharmacie dans les résultats

C'est précisément l'un des problèmes que tu viens de constater.

Lorsque l'utilisateur sélectionne :

Pharmacie Centrale

dans les résultats de recherche, la carte doit automatiquement :

identifier la pharmacie sélectionnée ;
retrouver son marqueur ;
centrer la carte sur cette pharmacie ;
éventuellement ajuster le zoom ;
mettre visuellement en évidence son marqueur ;
calculer l'itinéraire depuis la position de l'utilisateur ;
dessiner cet itinéraire sur la carte.
Résultat sélectionné
        │
        ▼
Pharmacie Centrale
        │
        ▼
📍 Marqueur pharmacie
        │
        ▼
Carte centrée
        │
        ▼
🚶 / 🚗 Itinéraire
        │
        ▼
🔵 Utilisateur ───────── 📍 Pharmacie
7. Trajet entre l'utilisateur et la pharmacie

Nous avions bien prévu que sélectionner une pharmacie doit permettre de tracer le chemin le plus court entre l'utilisateur et la pharmacie.

Il ne suffit donc pas de dessiner une ligne droite.

Il faut un véritable itinéraire basé sur le réseau routier disponible.

Par exemple :

🔵 Utilisateur
     │
     │ route
     │
     ├───────────┐
                 │
                 └──────── 📍 Pharmacie

Le trajet doit correspondre au déplacement réel.

8. Différence entre distance et trajet

Il faut également conserver la distinction :

Distance

Distance entre l'utilisateur et la pharmacie.

Exemple :

1,2 km

Temps à pied

Exemple :

15 min à pied

Temps en voiture

Exemple :

5 min en voiture

Ces informations doivent être cohérentes avec la localisation et le réseau routier.

9. Mise à jour pendant le déplacement

C'était également une exigence importante de notre spécification.

Si l'utilisateur se déplace :

Position initiale
🔵
  │
  │──────────────📍 Pharmacie

puis :

Nouvelle position
      🔵
       │──────────📍 Pharmacie

la carte doit actualiser la position de l'utilisateur.

Le trajet doit également être recalculé lorsque cela est nécessaire.

Donc la ligne ne doit pas rester figée à l'ancienne position.

10. Les pharmacies autour de l'utilisateur doivent évoluer

Lorsque l'utilisateur se déplace, la carte doit pouvoir détecter de nouvelles pharmacies pertinentes qui entrent dans sa zone de proximité.

Exemple :

Position 1
        🔵
    A       B


Position 2
             🔵
        B       C

La pharmacie C peut alors devenir pertinente alors qu'elle ne l'était pas auparavant.

Inversement, une pharmacie trop éloignée peut sortir de la zone pertinente.

11. La carte doit respecter les filtres de recherche

Si l'utilisateur recherche :

Paracétamol

la carte ne doit pas simplement afficher toutes les pharmacies connues.

Elle doit afficher les pharmacies qui répondent aux critères de cette recherche.

Donc :

Recherche : Paracétamol


Pharmacie A → Paracétamol disponible → 📍
Pharmacie B → Paracétamol disponible → 📍
Pharmacie C → Pas de Paracétamol → ❌
12. Les pharmacies fermées

Nous avions fixé une règle importante :

Une pharmacie fermée ne doit pas être retournée dans les résultats publics.

Cette règle doit également être respectée par la carte.

Donc :

Pharmacie A → ouverte → 📍 affichée
Pharmacie B → fermée → ❌

Les horaires doivent être une source de vérité pour déterminer l'état d'ouverture.

La carte ne doit donc pas afficher une pharmacie comme disponible simplement parce qu'elle existe dans la base.

13. Clic sur un marqueur

Le comportement doit fonctionner dans les deux directions.

Résultat → carte
[Pharmacie Centrale]
        ↓
marqueur sélectionné
        ↓
itinéraire
Carte → résultat

Si l'utilisateur clique directement sur le marqueur :

📍 Pharmacie Centrale
        ↓
résultat correspondant sélectionné

La carte et la liste doivent donc rester synchronisées.

14. Sélection unique

Lorsqu'une pharmacie est sélectionnée, elle doit être identifiable visuellement.

Par exemple :

Résultats


[ Pharmacie A ]     ← sélectionnée
[ Pharmacie B ]
[ Pharmacie C ]


Carte


📍 A ← mis en évidence
📍 B
📍 C

Cela évite que l'utilisateur ne sache pas quelle pharmacie est actuellement sélectionnée.

15. « Voir le détail »

Si l'utilisateur clique sur :

Voir le détail

du résultat :

Pharmacie Centrale
Paracétamol 500 mg
Stock : 24
[Voir le détail]

il doit être envoyé vers la page détail de cette pharmacie.

La page détail doit pouvoir présenter les produits disponibles de la pharmacie et permettre de rechercher un autre médicament dans cette structure, conformément à notre spécification.

16. La recherche d'un autre médicament

Si l'utilisateur est sur la page détail d'une pharmacie et recherche :

Amoxicilline

le système doit rechercher ce médicament dans cette pharmacie.

Cela ne doit pas provoquer une recherche globale incohérente sans que l'utilisateur le demande.

17. Carte initiale

Lorsque l'utilisateur arrive sur le moteur de recherche pharmacie sans recherche précise :

La carte peut afficher les pharmacies ouvertes autour de lui, selon le périmètre défini par le système.

Une fois une recherche effectuée, la carte doit passer au contexte :

Pharmacies ouvertes + correspondant à la recherche + géolocalisées.

18. Synchronisation état recherche ↔ état carte

C'est probablement le point principal de ton problème actuel.

Il doit exister un état commun représentant la recherche actuelle.

Conceptuellement :

                Recherche
                   │
                   ▼
             Résultats API
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Liste              Carte

Et non :

Recherche → Liste


Carte → autre recherche indépendante

La sélection doit également être commune :

selectedPharmacyId
        │
   ┌────┴─────┐
   ▼          ▼
Liste       Carte

Si selectedPharmacyId = pharmacie_123, les deux interfaces savent que la pharmacie sélectionnée est la même.

19. Ce que la carte ne doit surtout pas faire

Elle ne doit pas :

afficher des pharmacies fermées dans le contexte de recherche ;
afficher des pharmacies qui ne possèdent pas le médicament recherché ;
afficher des coordonnées différentes de celles de la structure ;
rester centrée sur une ancienne position utilisateur ;
afficher un itinéraire vers une pharmacie différente de celle sélectionnée ;
conserver un itinéraire après sélection d'une autre pharmacie ;
charger toutes les pharmacies de la base inutilement ;
envoyer toutes les données en une seule fois ;
fonctionner avec une liste indépendante des résultats de recherche.
20. Workflow complet attendu
Utilisateur
    │
    ▼
Autorise la géolocalisation
    │
    ▼
Position utilisateur récupérée
    │
    ▼
Recherche "Paracétamol"
    │
    ▼
Backend
    │
    ├── recherche médicament
    ├── vérifie stock
    ├── vérifie horaires
    ├── vérifie localisation
    ├── calcule proximité
    └── retourne résultats paginés
    │
    ▼
┌───────────────────────┬────────────────────────┐
│ LISTE                 │ CARTE                  │
│                       │                        │
│ Pharmacie A           │ 📍 A                   │
│ Pharmacie B           │ 📍 B                   │
│ Pharmacie C           │ 📍 C                   │
│                       │                        │
└───────────────────────┴────────────────────────┘
    │
    ▼
Utilisateur sélectionne A
    │
    ├── carte centre A
    ├── marqueur A sélectionné
    ├── position utilisateur affichée
    └── itinéraire calculé
             │
             ▼
      🔵 Utilisateur
             │
             │ trajet routier
             ▼
        📍 Pharmacie A

Puis, si l'utilisateur se déplace :

Nouvelle position
       ↓
Mise à jour GPS
       ↓
Recalcul distance
       ↓
Mise à jour temps
       ↓
Recalcul itinéraire si nécessaire
       ↓
Recherche de nouvelles pharmacies pertinentes
       ↓
Mise à jour carte + résultats