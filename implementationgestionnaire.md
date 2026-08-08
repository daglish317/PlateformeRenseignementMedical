SPÉCIFICATION FONCTIONNELLE
Module : Approvisionnement
Dashboard Gestionnaire de Pharmacie — SantéProx
1. Objectif du module

Le module Approvisionnement permet au gestionnaire d'enregistrer chaque livraison reçue par la pharmacie.

Chaque approvisionnement représente une livraison complète provenant d'un fournisseur.

Une livraison peut contenir un ou plusieurs médicaments.

Le module Approvisionnement constitue l'unique point d'entrée permettant d'ajouter des produits dans le stock.

Aucune augmentation directe du stock ne doit être possible depuis un autre module.

2. Objectifs métier

Le module doit permettre :

d'enregistrer rapidement une livraison ;
de limiter au maximum les saisies répétitives ;
de reconnaître automatiquement les médicaments déjà connus ;
de créer automatiquement les nouveaux médicaments lorsque nécessaire ;
de mettre à jour immédiatement le stock ;
de conserver une traçabilité complète de toutes les opérations.

L'interface doit privilégier :

la simplicité ;
la rapidité ;
la fiabilité ;
la réduction des erreurs.
3. Architecture de l'interface

L'écran est composé de trois zones clairement séparées.

Zone 1 — Informations générales de la livraison

Cette zone apparaît toujours en haut.

Elle contient les informations concernant la livraison.

Champs :

Date de réception
Fournisseur
Référence du bon de livraison
Date de réception

Renseignée automatiquement avec la date du jour.

Le gestionnaire peut la modifier si nécessaire.

Fournisseur

Champ texte.

Dans cette première version, il est libre.

Une évolution future permettra de le relier à un module Fournisseurs sans modifier cette interface.

Référence du bon de livraison

Champ texte.

Permet de conserver la référence figurant sur le bon remis par le fournisseur.

Ce champ reste optionnel.

Zone 2 — Formulaire d'ajout d'un médicament

Le formulaire permet d'ajouter un seul médicament à la fois.

Chaque validation ajoute ce médicament à la livraison en cours.

Le formulaire contient uniquement les champs suivants :

Nom du médicament
Forme pharmaceutique
Quantité
Prix d'achat
Prix de vente
Date de péremption
TVA
Produit en réserve

Le bouton :

Ajouter à la livraison

n'enregistre pas encore l'approvisionnement.

Il ajoute simplement le médicament à la liste de la livraison.

Après chaque ajout :

le formulaire est réinitialisé ;
le gestionnaire peut immédiatement saisir le médicament suivant.
Zone 3 — Liste des médicaments de la livraison

Sous le formulaire apparaît la liste des médicaments déjà ajoutés.

Chaque ligne affiche :

Nom
Forme
Quantité
Prix d'achat
Prix de vente
Date de péremption
TVA
Réserve

Chaque ligne possède uniquement deux actions :

Modifier
Supprimer

Ces actions restent disponibles tant que la livraison n'a pas été validée.

En bas de cette liste apparaît un unique bouton :

Enregistrer l'approvisionnement

Ce bouton valide la livraison complète.

4. Fonctionnement intelligent du formulaire
Nom du médicament

Ce champ fonctionne comme une Combobox avec autocomplétion.

À chaque caractère saisi, le système recherche automatiquement les médicaments déjà enregistrés.

Cas 1 : médicament existant

Le système affiche les propositions.

Lorsque le gestionnaire sélectionne un médicament :

les informations déjà connues sont automatiquement renseignées :

forme pharmaceutique ;
TVA ;
prix de vente enregistré (si disponible).

Le gestionnaire complète uniquement :

quantité ;
prix d'achat ;
prix de vente si nécessaire ;
date de péremption ;
réserve.
Cas 2 : nouveau médicament

Aucune proposition n'est trouvée.

Le gestionnaire continue simplement la saisie.

Aucune fenêtre modale.

Aucune redirection.

Aucune étape supplémentaire.

Lors de la validation finale de la livraison, le système créera automatiquement la fiche du médicament.

Forme pharmaceutique

Liste prédéfinie.

Aucune saisie libre.

Exemples :

Comprimé
Capsule
Gélule
Sirop
Solution buvable
Injectable
Crème
Pommade
Gel
Spray
Collyre
Sachet
Ampoule
Suppositoire
Autre
Quantité

Champ numérique.

Valeur strictement supérieure à zéro.

Prix d'achat

Champ numérique obligatoire.

Correspond au prix payé par la pharmacie pour une unité.

Prix de vente

Champ numérique.

Si TVA est activée :

le champ devient automatiquement désactivé.

Date de péremption

Champ obligatoire.

Sélection via un calendrier.

Une date antérieure à la date du jour est refusée.

TVA

Interrupteur Oui / Non.

Lorsque TVA est activée :

le prix de vente devient non modifiable.
Produit en réserve

Case à cocher.

Indique que le produit ne doit pas être immédiatement proposé à la vente.

5. Workflow complet

Le gestionnaire reçoit une livraison accompagnée d'un bon de livraison.

Il ouvre le module Approvisionnement.

Il renseigne :

la date de réception ;
le fournisseur ;
la référence du bon de livraison.

Ensuite :

Il complète le formulaire d'un médicament.

Il clique sur :

Ajouter à la livraison

Le médicament apparaît immédiatement dans la liste.

Le formulaire est vidé.

Le gestionnaire recommence pour chaque médicament reçu.

Lorsque tous les médicaments sont présents dans la liste :

Il clique sur :

Enregistrer l'approvisionnement

6. Validation

La livraison constitue une seule opération.

Le système vérifie l'ensemble des médicaments.

Si une seule ligne comporte une erreur :

aucun médicament n'est enregistré.

Le système indique précisément les lignes concernées.

Le gestionnaire corrige les erreurs.

Puis relance la validation.

Cette règle garantit qu'une livraison est toujours enregistrée dans son intégralité.

7. Traitement effectué après validation

Lorsque toutes les vérifications sont validées, le système :

crée automatiquement les nouveaux médicaments inexistants ;
met à jour les médicaments existants si nécessaire ;
crée un approvisionnement représentant la livraison complète ;
enregistre chaque ligne de la livraison ;
met immédiatement à jour le stock ;
recalcule les niveaux de stock ;
met à jour les alertes de stock ;
enregistre l'opération dans l'historique.

Toutes ces opérations sont automatiques.

Le gestionnaire ne réalise aucune manipulation supplémentaire.

8. Traçabilité

Le système enregistre automatiquement :

Livraison
date de réception ;
fournisseur ;
référence du bon de livraison ;
date de création ;
heure de création ;
utilisateur ayant enregistré la livraison ;
structure concernée.
Pour chaque médicament
médicament ;
forme pharmaceutique ;
quantité ;
prix d'achat ;
prix de vente ;
date de péremption ;
TVA ;
état réserve.

Ces informations constituent un historique permanent.

9. Sécurité

Le gestionnaire ne peut jamais augmenter directement le stock.

Toute augmentation du stock doit obligatoirement provenir d'un approvisionnement validé.

Chaque opération est automatiquement associée à son auteur.

Une livraison validée ne peut plus être modifiée ni supprimée.

En cas d'erreur, le système devra utiliser un mécanisme de régularisation afin de conserver un historique complet.

10. Interactions avec les autres modules

Le module Approvisionnement met automatiquement à jour :

le module Stock ;
le module Historique ;
le module Alertes.

Ces modules ne doivent jamais permettre d'augmenter directement le stock.

11. Résultat attendu

À la fin d'un approvisionnement validé :

la livraison est enregistrée ;
tous les médicaments de la livraison sont enregistrés ;
les nouveaux médicaments sont créés automatiquement si nécessaire ;
les médicaments existants sont réutilisés automatiquement ;
les quantités en stock sont mises à jour immédiatement ;
les alertes sont recalculées ;
l'historique est conservé ;
chaque opération est rattachée à son auteur et à sa structure.

L'objectif est d'offrir au gestionnaire un workflow fluide, rapide et sécurisé, tout en garantissant au propriétaire une traçabilité complète et une confiance maximale dans les données de stock.