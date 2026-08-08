# Module Vente et Caisse - Pharmacie SanteProx

## Objectif

Le module Vente permet au gestionnaire de preparer une vente de medicaments et de la transmettre a la caisse. Le gestionnaire ne realise jamais l'encaissement.

Le module Caisse permet au caissier de consulter les ventes en attente, de valider le paiement, d'annuler une vente transmise, de generer la facture et de tracer les impressions.

## Regles metier principales

- Le stock physique n'est pas modifie pendant la preparation de la vente.
- Une vente en preparation peut etre modifiee uniquement par un `GESTIONNAIRE`.
- L'envoi a la caisse reserve les quantites dans `StockItem.quantite_reservee`.
- Le stock disponible correspond a `quantite - quantite_reservee`.
- Les autres gestionnaires voient immediatement cette nouvelle disponibilite via la recherche de medicaments.
- Une vente transmise a la caisse est verrouillee: lignes, quantites et prix ne sont plus modifiables.
- Le paiement est valide uniquement par un `CAISSIER`.
- La validation du paiement est transactionnelle: vente payee, paiement cree, facture creee, stock physique diminue, reservation liberee, mouvement de stock journalise.
- L'annulation par la caisse libere les quantites reservees et conserve le stock physique.
- L'expiration annule automatiquement les ventes en attente ou en cours dont le delai est depasse, puis libere les reservations.
- Les impressions et reimpressions de facture sont journalisees.

## Permissions

- `GESTIONNAIRE`: creer une vente, recuperer sa vente en preparation, ajouter/modifier/supprimer une ligne, annuler une vente en preparation, envoyer a la caisse, consulter l'historique de sa structure.
- `CAISSIER`: ouvrir une vente transmise, valider le paiement, annuler a la caisse, consulter les paiements, imprimer/reimprimer les factures, gerer les retours caisse.
- `PROPRIETAIRE`: supervision lecture seule sur la caisse, statistiques et historique selon les endpoints autorises. Il ne peut pas preparer, modifier, envoyer ou encaisser une vente. En mode multi-structures, il selectionne la pharmacie a superviser.

## Backend

Application Django: `backend/ventes/`

Modeles:
- `Vente`: numero, etat, structure, gestionnaire preparateur, dates, expiration, client, totaux.
- `LigneVente`: medicament vendu, designation, forme, prix unitaire, quantite, montant.
- `Paiement`: mode, montant, caissier, date.
- `Facture`: numero unique, vente, paiement, total.
- `ImpressionFacture`: journal des impressions/reimpressions.
- `RetourCaisse` et `RetourCaisseLigne`: retours rattaches a la vente/facture initiale.
- `OperationCaisse`: journal d'audit des actions caisse.

Endpoints principaux:
- `POST /api/ventes/`: creer une vente en preparation.
- `GET /api/ventes/preparation/?structure_id=<uuid>`: recuperer la vente en preparation du gestionnaire.
- `POST /api/ventes/<uuid>/lignes/`: ajouter une ligne.
- `PATCH /api/ventes/<uuid>/lignes/<uuid>/`: modifier une quantite.
- `DELETE /api/ventes/<uuid>/lignes/<uuid>/supprimer/`: supprimer une ligne.
- `POST /api/ventes/<uuid>/envoyer-caisse/`: reserver le stock et transmettre a la caisse.
- `POST /api/ventes/<uuid>/annuler/`: annuler une vente en preparation.
- `GET /api/ventes/caisse/attente/`: ventes a encaisser.
- `GET /api/ventes/caisse/attente/?structure_id=<uuid>`: supervision proprietaire des ventes de la pharmacie selectionnee.
- `POST /api/ventes/caisse/<uuid>/ouvrir/`: ouverture caisse.
- `POST /api/ventes/caisse/<uuid>/paiement/`: validation paiement.
- `POST /api/ventes/caisse/<uuid>/annuler/`: annulation caisse.
- `GET /api/ventes/caisse/<uuid>/facture/`: detail facture.
- `POST /api/ventes/caisse/<uuid>/facture/imprimer/`: journaliser une impression.
- `GET /api/ventes/caisse/<uuid>/reception/pdf/`: telecharger le recu PDF.

## Corrections de verification

- Les endpoints de preparation de vente utilisent maintenant `gestionnaire_required`, pas `responsable_structure_required`, pour respecter la specification: le proprietaire supervise mais ne prepare pas la vente.
- Le recu PDF est maintenant envoye via `BytesIO` avec `FileResponse`, comme attendu par Django.
- La recherche des medicaments vendables filtre les medicaments sans prix, en rupture ou totalement reserves.
- Des tests de non-regression ont ete ajoutes pour refuser la preparation/modification/envoi par le proprietaire et verifier la recherche des medicaments vendables.

## Frontend

Routes:
- `/pharmacy/sale`: interface de preparation de vente pour le gestionnaire.
- `/caissier`: interface caisse pour les ventes en attente, paiements, factures, impressions, retours et historique.
- `/owner/caisse`: supervision proprietaire en lecture seule, avec selection de pharmacie.

Fonctionnalites UI:
- Creation automatique d'une vente en preparation.
- Affichage du numero, date/heure, gestionnaire connecte, total articles et montant.
- Combobox medicament avec stock disponible.
- Ajout, modification et suppression de lignes en preparation.
- Calcul automatique des montants.
- Envoi a la caisse.
- Cote caisse: validation, annulation, facture, impression/reimpression, retours et historique.
- Cote proprietaire: consultation des ventes, paiements, retours et historique par pharmacie, sans action d'encaissement, d'annulation ou de retour.

## Verification

Checks executes:
- `python manage.py check`
- `python manage.py makemigrations --check --dry-run`
- Import Django des vues `ventes` et `stock`
- `npm run lint`
- `npm run build`

Limite locale:
- `python manage.py test ventes` trouve 62 tests mais ne peut pas creer la base de test PostgreSQL: l'utilisateur local n'a pas le droit `CREATE DATABASE`.
