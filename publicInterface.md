Prompt UI/UX – Refonte responsive Header + Carte + Recherche (SantéProx)

Nous travaillons sur SantéProx, une plateforme de géolocalisation médicale.

L'objectif est d'obtenir une interface de qualité professionnelle, comparable aux applications modernes comme Google Maps, Uber ou Airbnb, tout en restant adaptée au domaine médical.

Les modifications doivent respecter une architecture React/Next.js modulaire. Aucun composant ne doit devenir monolithique.

1. Objectif général

L'application possède deux fonctionnalités principales :

la recherche médicale (résultats)
la carte

Aucune des deux ne doit être considérée comme secondaire.

L'interface doit toujours permettre d'accéder rapidement aux deux.

2. Desktop

Sur ordinateur :

Disposition conservée :

----------------------------------------------------

Sidebar Recherche

|

|

|

|

------------------|-------------------------------

                  |

                  |

                  |

                  |

                Carte

----------------------------------------------------

La sidebar reste fixe à gauche.

La carte occupe tout l'espace restant.

Aucun changement majeur de comportement.

3. Mobile

Le comportement actuel doit être supprimé.

Il ne doit plus y avoir :

Bottom Sheet
panneau flottant
carte en arrière-plan
double scroll
panneau fixe

À la place :

L'application possède deux vues :

Vue Recherche

Affiche :

header
résultats
pagination

La carte est masquée.

Vue Carte

Affiche :

header
carte plein contenu

Les résultats sont masqués.

La navigation entre ces deux vues doit être instantanée.

Aucun rechargement.

4. Navigation mobile

Créer une navigation flottante moderne.

Position :

bottom-center

Disposition :

┌────────────────────────────┐

   🔎 Recherche    🗺 Carte

└────────────────────────────┘

Style :

floating
blur
ombre douce
coins très arrondis
largeur adaptée au contenu

Le bouton actif possède :

fond primaire
texte blanc

Le bouton inactif :

fond blanc (ou surface en mode sombre)
texte gris

Animation :

transition fluide.

5. Scroll mobile

Le scroll doit être entièrement revu.

Exigences :

Aucun double scroll.

Une seule zone défile.

La page reste parfaitement fluide.

Le changement Recherche ↔ Carte ne doit jamais casser le scroll.

6. Carte

La carte doit ressembler davantage à Google Maps.

Le rendu actuel est trop vide.

Le fond blanc est trop agressif.

Le paysage doit ressortir.

Les routes doivent être bien visibles.

Les espaces verts également.

Les plans d'eau également.

Le rendu doit être vivant.

7. Thème sombre

Le thème sombre actuel est trop noir.

Utiliser une palette plus proche de Google Maps Dark.

Éviter le noir pur.

Conserver un bon contraste.

8. Bouton "Ma position"

Le bouton actuel doit être redesigné.

Il doit ressembler aux Floating Action Buttons modernes.

Caractéristiques :

cercle
ombre légère
fond blanc
effet glass léger

En mode sombre :

surface sombre.

La couleur de l'icône ne doit plus être bleue.

Utiliser :

vert.

9. Position utilisateur

Le marqueur utilisateur ne doit plus être bleu.

Pourquoi :

Dans SantéProx :

hôpitaux = bleu
pharmacies = rouge

Le bleu crée une confusion.

Le marqueur utilisateur doit être :

vert.

Animation douce.

Halo vert semi-transparent.

Style inspiré de Google Maps.

10. Itinéraire

La ligne d'itinéraire doit devenir verte.

Épaisseur légèrement supérieure.

Extrémités arrondies.

Aspect premium.

11. Marqueurs

Les marqueurs doivent avoir une identité plus forte.

Ne pas utiliser uniquement :

H

P

Ils doivent évoquer immédiatement :

hôpital
pharmacie

Conserver une très bonne lisibilité.

Ajouter une légère ombre.

12. Chargement carte

Supprimer le spinner.

Créer un skeleton moderne.

Inspiré de Google Maps.

Avec shimmer.

13. Responsive Header

Desktop :

Conserver le fonctionnement actuel.

Mobile :

Le header est simplifié.

Afficher uniquement :

Logo

Barre de recherche

Menu hamburger

Disposition :

LOGO

[ Recherche........................ ]

                ☰

Le logo devient compact.

La barre de recherche occupe tout l'espace disponible.

Le bouton hamburger ouvre un Drawer.

14. Contenu du Drawer

Le Drawer contient :

changer de langue
thème
inscription (si nécessaire) ou deconnexion pour ceux qui son connecter
favoris
feedback
aucune autre information que celle citer ne doit figurer

Le Drawer doit être moderne.

Animation fluide.

Fermeture par swipe ou clic extérieur.

15. Performances

Toutes les modifications doivent respecter :

Next.js  et notre system de navigation actuel francais anglais
React
TypeScript
Tailwind
shadcn/ui

Aucun rerender inutile.

Utiliser :

dynamic imports
memo
stores uniquement lorsque nécessaire
16. Architecture

Aucun gros composant.

Créer des composants spécialisés.

Respecter une architecture modulaire.

Chaque responsabilité doit être clairement séparée.

17. Objectif final

Le résultat doit donner l'impression d'une application mobile professionnelle destinée au grand public, avec un niveau de finition proche de Google Maps, Uber ou Airbnb, tout en conservant une identité visuelle adaptée au domaine médical.