1. Rôle de la carte

La carte est l'interface principale de visualisation géographique.

Elle permet à l'utilisateur de :

visualiser les structures médicales ;
visualiser sa propre position ;
rechercher des structures ;
trouver les structures les plus proches ;
obtenir un itinéraire ;
afficher les détails d'une structure ;
filtrer les résultats ;
basculer entre la liste et la carte.

La carte n'est donc pas uniquement une représentation graphique, mais un véritable outil de recherche.

2. Technologies

Nous avions retenu :

Leaflet
OpenStreetMap
PostGIS côté base de données
Géolocalisation HTML5 du navigateur
API de calcul d'itinéraire
3. Chargement initial

Au chargement de la page :

demander l'autorisation de localisation ;
récupérer la position GPS si acceptée ;
centrer la carte sur l'utilisateur ;
afficher les structures autour de lui.

Si refus :

afficher la carte sur une position par défaut ;
continuer à fonctionner normalement.
4. Position de l'utilisateur

La position de l'utilisateur doit être clairement visible.

Elle comporte :

un marqueur spécifique ;
un cercle de précision GPS ;
possibilité de recentrer la carte.
5. Types de structures affichées

La carte affiche uniquement :

Hôpitaux
Pharmacies

Pas d'autres catégories.

6. Icônes différentes

Chaque type possède une icône propre.

Exemple :

hôpital
pharmacie

Les icônes doivent rester lisibles à tous les niveaux de zoom.

7. Couleurs

Les couleurs doivent permettre d'identifier immédiatement :

pharmacie
hôpital

Les couleurs doivent rester cohérentes avec toute l'identité graphique.

8. Marqueurs

Chaque structure possède son propre marqueur.

Le marqueur représente :

type
disponibilité
état
9. Popup

Un clic sur un marqueur ouvre une popup.

Elle affiche :

nom
type
adresse
distance
temps estimé
téléphone
horaires
bouton Voir la fiche
bouton Itinéraire
10. Fiche détaillée

Depuis la popup :

l'utilisateur peut ouvrir la fiche complète de la structure.

11. Recherche

La carte doit réagir instantanément à la recherche.

Lorsque l'utilisateur recherche :

une maladie
un médicament
une structure

la carte :

centre automatiquement ;
met les résultats en évidence ;
masque les structures non concernées.
12. Recherche par maladie

Nous avions validé :

la recherche d'une maladie ne retourne que les hôpitaux prenant cette maladie en charge.

La carte ne montre donc pas les pharmacies.

13. Recherche par médicament

La recherche d'un médicament ne retourne que les pharmacies possédant ce médicament.

Les hôpitaux ne sont pas affichés.

14. Recherche par nom

Recherche directe d'une structure.

La carte :

centre dessus ;
ouvre automatiquement son popup.
15. Résultats multiples

Lorsque plusieurs structures correspondent :

tous les marqueurs apparaissent ;
les résultats sont numérotés ;
la liste reste synchronisée.
16. Synchronisation Carte ↔ Liste

Nous avions insisté sur cette synchronisation.

Si l'utilisateur :

sélectionne une carte

→ la liste sélectionne le même élément.

Si l'utilisateur :

sélectionne un élément de la liste

→ la carte centre ce marqueur.

17. Carte ↔ Barre de recherche

La barre de recherche pilote directement la carte.

La carte doit réagir sans bouton "Rechercher".

18. Zoom automatique

Après une recherche :

la carte ajuste automatiquement le niveau de zoom.

19. Déplacement manuel

Si l'utilisateur déplace la carte :

les résultats peuvent être rechargés selon la zone visible.

20. Itinéraire

Depuis un résultat :

l'utilisateur peut demander un itinéraire.

La carte affiche :

trajet
départ
arrivée
21. Temps de trajet

La carte affiche :

temps estimé
distance
22. Types de transport

Le système doit prévoir :

voiture
marche

(évolutif vers d'autres modes).

23. Structures proches

La carte doit pouvoir afficher :

les structures les plus proches.

24. Gestion des urgences

Pour le mode urgence :

la carte affiche directement :

les établissements adaptés ;
le plus proche en priorité.
25. Actualisation

Lorsqu'une structure est mise à jour :

la carte doit refléter les nouvelles données.

26. Gestion des stocks

Pour les pharmacies :

la carte ne doit afficher comme résultat que celles disposant réellement du médicament recherché.

27. Gestion des prises en charge

Pour les hôpitaux :

la carte n'affiche que ceux capables de traiter la pathologie recherchée.

28. Performances

Nous avions validé :

chargement rapide ;
pagination côté serveur si nécessaire ;
affichage uniquement des résultats utiles.
29. Responsive

Nous avions beaucoup détaillé cette partie.

Sur mobile :

la carte occupe la majeure partie de l'écran ;
la liste est accessible séparément ;
les contrôles restent accessibles ;
les boutons ne masquent pas la carte.
30. Comportement mobile

Sur téléphone :

la carte est prioritaire ;
la liste est affichée via un panneau coulissant ;
les interactions tactiles restent fluides.
31. Contrôles

La carte comporte :

zoom +
zoom -
recentrer
localisation actuelle
32. État vide

Si aucun résultat :

la carte reste affichée.

Un message informe simplement :

Aucun établissement correspondant à votre recherche.

33. Gestion des erreurs

Si :

GPS indisponible ;
connexion perdue ;
erreur serveur ;

la carte doit continuer à fonctionner autant que possible et afficher un message approprié.

34. Architecture

Nous avions également validé que la partie cartographique soit modulaire, avec une séparation claire entre :

composant principal de la carte ;
gestion des marqueurs ;
calcul d'itinéraires ;
géolocalisation de l'utilisateur ;
gestion des popups ;
synchronisation avec la recherche ;
synchronisation avec la liste des résultats ;
filtres ;
services d'appel API.

NB: la carte de doit plus etre noir en mode sombre ou blanc en mode claire elle doit ressembler a google map elle doit ressortir le paysage avec cest couleur naturel et doit zoumer au maximum possible on doit pouvoir distinguer les batiments le route et autre
la carte doit etre en bas de card de suggestion de recherche donc bien regle l'index de c'est element