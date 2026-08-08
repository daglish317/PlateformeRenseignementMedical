SPÉCIFICATION FONCTIONNELLE
Module : Vente
Dashboard Gestionnaire de Pharmacie — SantéProx
1. Objectif du module

Le module Vente permet au gestionnaire de préparer une vente de médicaments destinée à un client.

Le gestionnaire ne réalise jamais l'encaissement.

Son rôle est de :

rechercher les médicaments ;
préparer la vente ;
transmettre la vente à la caisse.

Le paiement est exclusivement réalisé par le caissier.

Le stock physique n'est jamais modifié tant que le paiement n'a pas été validé.

2. Objectifs métier

Le module doit permettre :

de préparer rapidement une vente ;
d'éviter les erreurs de saisie ;
d'empêcher les ventes supérieures au stock disponible ;
de gérer plusieurs gestionnaires travaillant simultanément ;
de réserver automatiquement les produits en attente de paiement ;
de transmettre la vente à la caisse ;
d'assurer une traçabilité complète.
3. Architecture de l'interface

L'écran est composé de trois zones.

Zone 1 — Informations de la vente

Située en haut de la page.

Elle contient :

Numéro de vente (généré automatiquement)
Date
Heure
Gestionnaire connecté

Ces informations sont uniquement affichées.

Elles ne sont jamais modifiables.

Zone 2 — Formulaire d'ajout d'un médicament

Le formulaire permet d'ajouter un médicament à la vente.

Il contient :

Nom du médicament
Quantité
Prix unitaire
Montant

Le bouton :

Ajouter à la vente

ajoute le médicament à la vente en cours.

Le formulaire est ensuite automatiquement vidé.

Le gestionnaire peut immédiatement ajouter un autre médicament.

Zone 3 — Liste des médicaments

Sous le formulaire apparaît la liste des médicaments sélectionnés.

Chaque ligne contient :

Désignation
Prix unitaire
Quantité
Montant

Chaque ligne possède uniquement :

Modifier
Supprimer

En bas apparaissent :

Nombre total d'articles
Montant total

Puis le bouton :

Envoyer à la caisse

4. Fonctionnement intelligent
Nom du médicament

Fonctionne comme une Combobox intelligente.

À chaque caractère saisi :

le système recherche automatiquement les médicaments disponibles.

Les propositions affichent :

nom du médicament ;
forme pharmaceutique ;
stock disponible.

Exemple :

Paracétamol 500 mg
Comprimé
Disponible : 42

Lorsque le médicament est sélectionné :

le système remplit automatiquement :

prix de vente ;
forme pharmaceutique.

Le gestionnaire ne saisit que :

quantité.
Quantité

Le système vérifie immédiatement le stock disponible.

Exemple :

Disponible :

42

Si le gestionnaire saisit :

43

Le système refuse immédiatement.

La vente ne peut jamais dépasser le stock disponible.

Prix

Le prix est automatiquement récupéré.

Le gestionnaire ne peut pas le modifier.

Si le médicament utilise un calcul par coefficient (cas des produits soumis à TVA sans prix de vente prédéfini), le prix affiché correspond au prix de vente déjà calculé et enregistré lors de l'approvisionnement.

Le calcul du coefficient n'est donc jamais effectué au moment de la vente.

5. Calcul automatique

À chaque ajout ou modification :

le système calcule automatiquement :

Montant ligne

Prix unitaire × Quantité

Puis :

Montant total

Somme de toutes les lignes

Le gestionnaire ne réalise jamais de calcul.

6. Workflow de préparation

Le gestionnaire ouvre le module Vente.

Le système crée automatiquement une nouvelle vente.

Il ajoute les médicaments un par un.

Après chaque ajout :

la ligne apparaît dans la liste ;
le montant est recalculé.

Le gestionnaire peut :

modifier une ligne ;
supprimer une ligne.

Une fois la vente terminée :

Il clique sur :

Envoyer à la caisse

7. Validation avant envoi

Avant l'envoi :

Le système vérifie :

chaque médicament existe ;
chaque quantité est disponible ;
chaque prix est valide.

Si une erreur existe :

la vente reste ouverte.

Aucune réservation n'est effectuée.

8. Réservation automatique

Lorsque la vente est envoyée :

Le système réserve automatiquement les quantités.

Le stock physique reste inchangé.

Le système met à jour :

Stock réservé.

Puis :

Stock disponible.

Le stock disponible devient :

Stock physique − Stock réservé

Tous les autres gestionnaires voient immédiatement cette nouvelle disponibilité.

9. État de la vente

Une vente possède toujours un état.

Les états possibles sont :

En préparation
En attente de paiement
Payée
Annulée
Expirée

Le changement d'état est entièrement géré par le système.

10. Expiration automatique

Une vente en attente de paiement possède une durée maximale configurable (par exemple 15 ou 30 minutes).

Si ce délai est dépassé sans validation ni annulation :

Le système :

annule automatiquement la vente ;
libère les quantités réservées ;
remet le stock disponible à jour ;
enregistre le motif :

Expiration du délai de paiement

11. Transmission à la caisse

Après réservation :

La vente apparaît automatiquement dans le tableau des ventes en attente de paiement du caissier.

Le gestionnaire ne peut plus :

modifier les produits ;
modifier les quantités ;
modifier les prix.

La vente devient totalement verrouillée.

12. Interface du caissier

Le caissier visualise uniquement :

Numéro de vente
Heure
Gestionnaire ayant préparé la vente
Liste des médicaments
Prix unitaires
Quantités
Montants
Montant total

Le caissier ne peut modifier aucune de ces informations.

Il choisit uniquement :

le mode de paiement ;
Valider ;
Annuler.
13. Validation du paiement

Lorsque le caissier valide :

Le système exécute automatiquement, dans une seule transaction logique :

valide la vente ;
diminue le stock physique des quantités vendues ;
supprime les quantités réservées ;
recalcule le stock disponible ;
enregistre le paiement ;
génère la facture (reçu de paiement) ;
envoie la facture vers l'imprimante configurée ;
archive définitivement la vente ;
met à jour les statistiques ;
inscrit toutes les opérations dans l'historique.

Si une étape échoue, la transaction est annulée afin de préserver la cohérence des données.

14. Annulation du paiement

Si le caissier annule :

Le système :

annule la vente ;
libère les quantités réservées ;
remet immédiatement le stock disponible à jour ;
conserve le stock physique inchangé ;
enregistre le motif d'annulation dans l'historique.

Aucune facture n'est générée.

15. Génération de la facture

Après validation du paiement :

Le système génère automatiquement une facture unique.

La facture contient :

Informations de la pharmacie
Nom
Adresse
Téléphone
Informations de la vente
Numéro de facture
Numéro de vente
Date
Heure
Tableau des produits

Pour chaque médicament :

Désignation
Prix unitaire
Quantité
Montant
Totaux
Nombre total d'articles
Montant total TTC
Paiement
Mode de paiement
Date et heure du paiement
Informations de traçabilité
Gestionnaire ayant préparé la vente
Caissier ayant validé le paiement

Ces informations ne sont pas nécessairement imprimées sur le ticket destiné au client, mais elles sont conservées par le système afin d'assurer une traçabilité complète.

16. Impression

Après génération de la facture :

Le système envoie automatiquement le ticket vers l'imprimante thermique configurée.

Si aucune imprimante n'est disponible :

La facture reste accessible.

Le caissier peut lancer l'impression ultérieurement.

Chaque impression ou réimpression est enregistrée dans l'historique avec :

l'utilisateur ayant effectué l'action ;
la date et l'heure ;
le nombre total d'impressions.
17. Traçabilité

Le système conserve automatiquement :

Pour la vente :

numéro de vente ;
état ;
dates et heures de création, de transmission, de validation ou d'annulation.

Pour le gestionnaire :

identité du préparateur.

Pour le caissier :

identité de l'encaisseur.

Pour les médicaments :

produits vendus ;
quantités ;
prix unitaires appliqués ;
montants.

Pour le paiement :

mode de paiement ;
montant payé.

Pour les documents :

facture générée ;
historique des impressions.
18. Interactions avec les autres modules

Le module Vente est directement lié :

au module Stock (réservation, décrémentation et mise à jour des disponibilités) ;
au module Approvisionnement (source des médicaments et des prix de vente) ;
au module Caisse (validation ou annulation des paiements) ;
au module Historique (journalisation complète des opérations) ;
au module Statistiques (mise à jour des indicateurs de vente).

Le module Vente ne crée jamais de médicaments et ne modifie jamais directement les fiches de stock. Il exploite exclusivement les données issues de l'approvisionnement et applique les règles de disponibilité définies par le module Stock. Cette séparation garantit la cohérence des données, limite les risques de fraude et permet au propriétaire de disposer d'une vision fiable de toutes les opérations réalisées dans sa pharmacie.