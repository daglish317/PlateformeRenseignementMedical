SPÉCIFICATION FONCTIONNELLE
Module Caisse
SantéProx – Dashboard CAISSE Pharmacie
1. Objectif

Le module Caisse est l'espace de travail du caissier.

Il reçoit les ventes préparées par les gestionnaires et permet exclusivement de gérer l'encaissement des clients.

Le caissier ne gère ni les médicaments, ni le stock, ni les prix.

Toutes les informations commerciales proviennent du module Vente.

Le module Caisse constitue la dernière étape avant la validation définitive d'une vente.

2. Principe métier

Le système sépare volontairement les responsabilités.

Le gestionnaire prépare les ventes.

Le caissier encaisse les paiements.

Le stock est mis à jour automatiquement.

Le propriétaire supervise l'ensemble des opérations.

Cette séparation garantit qu'aucune personne ne puisse contrôler seule tout le processus de vente.

3. Missions du module

Le module permet :

recevoir les ventes préparées ;
afficher les ventes en attente ;
consulter le détail d'une vente ;
encaisser un client ;
choisir le mode de paiement ;
valider ou refuser un paiement ;
générer automatiquement un reçu ;
imprimer le reçu ;
effectuer un retour en caisse lorsqu'une vente déjà terminée doit être corrigée ;
conserver une traçabilité complète.
4. Interface

Le module est organisé en quatre espaces.

4.1 Ventes en attente

Liste des ventes préparées par les gestionnaires.

Chaque ligne affiche uniquement :

Numéro de vente
Date
Heure
Gestionnaire ayant créé la vente
Nombre de produits
Statut

Le montant total n'est pas affiché dans cette liste.

Une recherche intelligente permet de retrouver une vente par :

numéro de vente ;
numéro de facture ;
nom du client (si renseigné) ;
téléphone (si renseigné).

Filtres :

Toutes
En attente
En cours
Expirées
4.2 Paiements réalisés

Historique des ventes encaissées.

Le caissier peut :

consulter une vente ;
consulter un reçu ;
réimprimer un reçu.

Aucune modification n'est possible.

4.3 Retours en caisse

Liste des corrections réalisées après impression d'un reçu.

Chaque retour reste lié à la facture d'origine.

4.4 Historique

Journal complet des opérations réalisées par le caissier.

Chaque action est enregistrée automatiquement.

5. Workflow d'une vente
Étape 1

Le gestionnaire prépare une vente.

La vente contient :

les produits ;
les quantités ;
les prix ;
la TVA ;
le total.

Lorsque le gestionnaire valide :

la vente est transmise à la caisse.

Étape 2

Le système réserve automatiquement les quantités.

Le stock disponible diminue.

Le stock physique ne change pas encore.

Les médicaments réservés ne peuvent plus être vendus par une autre personne.

Étape 3

La vente apparaît automatiquement dans la liste du caissier.

Le caissier ouvre la vente.

Il consulte uniquement :

les produits ;
les quantités ;
les prix ;
le total.

Tous les champs sont verrouillés.

Aucune modification n'est autorisée.

Étape 4

Le client règle son achat.

Le caissier choisit le mode de paiement.

Exemples :

Espèces
Mobile Money
Carte bancaire
Chèque (si la pharmacie l'autorise)

Le système enregistre le mode de paiement utilisé.

Étape 5

Le caissier valide le paiement.

Cette validation déclenche automatiquement une transaction unique.

Le système :

valide définitivement la vente ;
déduit les quantités du stock physique ;
supprime les réservations ;
met à jour le stock disponible ;
génère le reçu ;
enregistre le paiement ;
met à jour les statistiques ;
crée les mouvements d'historique.

Toutes ces opérations sont atomiques.

Si une seule échoue, aucune n'est conservée.

Étape 6

Le reçu est généré automatiquement.

Le système crée un document PDF.

Le document peut être :

imprimé ;
réimprimé ;
téléchargé.

Le reçu devient la preuve officielle de la vente.

6. Contenu du reçu

Le reçu comporte :

numéro du reçu ;
numéro de vente ;
date ;
heure ;
pharmacie ;
adresse ;
téléphone.

Puis un tableau :

Désignation
Prix unitaire
Quantité
Montant

En bas :

Sous-total
Total à payer
Mode de paiement

Puis :

Merci de votre visite.

7. Annulation avant impression

Tant que le reçu n'a pas été généré, la vente peut être annulée.

Le système :

annule la vente ;
supprime la réservation ;
remet les quantités dans le stock disponible ;
enregistre le motif d'annulation.

Aucune facture n'est créée.

8. Retour en caisse

Après impression du reçu, la vente devient définitive.

Elle ne peut plus être supprimée.

Si un problème survient :

le client retire un médicament ;
erreur de vente ;
erreur de quantité ;
erreur de paiement ;
autre situation.

Le caissier ouvre un retour en caisse.

Le système crée une nouvelle opération liée à la facture d'origine.

Le caissier choisit obligatoirement un motif.

Exemples :

Client sans argent
Produit retiré
Erreur de quantité
Erreur de prix
Retour accepté
Produit défectueux
Autre

Le motif "Autre" impose un commentaire.

Le système :

remet les produits concernés dans le stock ;
met à jour les statistiques ;
crée une écriture d'historique ;
conserve la facture initiale ;
relie les deux opérations.

Aucune facture n'est supprimée.

9. Sécurité

Le caissier peut :

consulter les ventes ;
encaisser ;
imprimer ;
réimprimer ;
effectuer un retour en caisse.

Le caissier ne peut jamais :

modifier les produits ;
modifier les prix ;
modifier la TVA ;
modifier les quantités ;
supprimer une vente ;
supprimer une facture ;
supprimer un retour ;
consulter le chiffre d'affaires ;
consulter les recettes journalières ;
consulter les recettes mensuelles ;
consulter les bénéfices ;
consulter les marges.

Le gestionnaire possède exactement les mêmes restrictions financières.

Le propriétaire est le seul utilisateur autorisé à consulter :

le chiffre d'affaires ;
les recettes ;
les marges ;
les bénéfices ;
les statistiques financières.
10. Traçabilité

Le système journalise automatiquement :

création de la vente ;
transmission à la caisse ;
ouverture par le caissier ;
validation ;
annulation ;
impression ;
réimpression ;
retour en caisse.

Pour chaque opération, sont enregistrés :

utilisateur ;
rôle ;
date ;
heure ;
adresse IP (si disponible) ;
type d'action ;
résultat.

Aucune entrée ne peut être supprimée.

11. Interactions avec les autres modules

Le module Caisse interagit avec :

Vente : réception des ventes préparées.
Stock : réservation, déduction et réintégration des quantités.
Approvisionnement : utilisation des informations produits et des prix définis lors des entrées en stock.
Historique : enregistrement de toutes les opérations.
Alertes : signalement des ruptures ou des seuils critiques après une vente.
Inventaire : prise en compte des mouvements de stock liés aux ventes et aux retours.
Statistiques : mise à jour des indicateurs autorisés selon les permissions.
Propriétaire : consultation complète des ventes, paiements, retours et historiques, sans possibilité de modifier les opérations déjà réalisées.
Règles métier figées
Une vente est toujours créée par un gestionnaire.
Une vente est toujours validée par un caissier.
Le stock n'est définitivement décrémenté qu'après validation du paiement.
Tant que le reçu n'est pas généré, la vente peut être annulée.
Après génération du reçu, toute correction passe obligatoirement par un retour en caisse.
Une facture n'est jamais supprimée.
Un retour en caisse est toujours lié à une facture existante.
Toutes les opérations sont historisées.
Les données financières globales sont exclusivement accessibles au propriétaire.
Les transactions critiques (validation, annulation, retour) sont atomiques afin de garantir la cohérence des stocks et des écritures.