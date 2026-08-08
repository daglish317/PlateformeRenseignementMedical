# Module Approvisionnement - Pharmacie SanteProx

## Objectif

Le module Approvisionnement permet au gestionnaire de pharmacie d'enregistrer une livraison complete recue d'un fournisseur. C'est le point d'entree metier pour augmenter le stock d'une pharmacie.

Aucune augmentation directe du stock pharmacie ne doit passer par un autre module. Les creations directes et imports generiques de stock restent bloques pour les pharmacies par les permissions backend.

## Workflow

L'interface `/pharmacy/supply` est organisee en trois zones:

- Informations de livraison: date de reception, fournisseur, reference du bon.
- Formulaire d'ajout d'un medicament: nom, forme, quantite, prix d'achat, prix de vente, date de peremption, TVA, produit en reserve.
- Liste temporaire des medicaments de la livraison: modification ou suppression possible tant que la livraison n'est pas enregistree.

Le bouton `Ajouter a la livraison` ajoute uniquement la ligne dans la livraison en cours cote frontend. Le bouton `Enregistrer l'approvisionnement` valide la livraison complete cote backend.

## Backend

Routes principales:
- `GET /api/stocks/medicaments/?structure_id=<uuid>&search=<texte>`: autocompletion des medicaments connus pour l'approvisionnement.
- `GET /api/stocks/medicaments/?structure_id=<uuid>&search=<texte>&vendable=true`: autocompletion filtree pour la vente uniquement.
- `GET /api/stocks/approvisionnements/?structure_id=<uuid>`: historique des livraisons.
- `POST /api/stocks/approvisionnements/`: validation d'une livraison complete.

Service:
- `ApprovisionnementService.enregistrer(...)` execute toute la livraison dans une transaction atomique.

Traitements apres validation:
- cree les nouveaux medicaments si necessaire;
- reutilise et met a jour les medicaments existants;
- cree l'approvisionnement;
- cree toutes les lignes de livraison;
- incremente le stock physique;
- cree un mouvement de stock par ligne;
- recalcule les alertes;
- notifie les responsables de structure;
- conserve l'auteur, la structure, la date et l'heure de creation.

## Validation

Chaque ligne est validee avant l'ecriture:
- nom obligatoire;
- forme pharmaceutique dans la liste autorisee;
- quantite strictement superieure a zero;
- prix d'achat obligatoire;
- prix de vente non negatif si fourni;
- date de peremption obligatoire et non passee.

Si une seule ligne est invalide, aucune donnee n'est persistee.

## Permissions

- `GESTIONNAIRE`: peut enregistrer une livraison et consulter l'historique de sa structure.
- `PROPRIETAIRE`: peut consulter selon les routes responsables, mais ne peut pas creer d'approvisionnement.
- `CAISSIER`: aucun acces a la creation d'approvisionnement.

## Produits en reserve

Le champ `en_reserve` est conserve sur le medicament et sur la ligne d'approvisionnement. Un produit marque en reserve n'est pas propose dans la recherche vendable utilisee par le module Vente.

## Protections stock

- `CreateStockView`, `EntreeStockView`, `ImportStockView` et `ImportMedicamentView` appellent `assert_structure_autorise_stock_direct`.
- Pour une pharmacie, ces entrees directes sont refusees: seul l'approvisionnement augmente le stock.
- Dans l'admin Django, les quantites de stock et les approvisionnements historiques sont rendus non modifiables directement.

## Frontend

Module: `frontend/src/features/approvisionnement/`

Fonctionnalites:
- date de reception pre-remplie avec la date du jour;
- fournisseur libre;
- reference optionnelle;
- combobox medicament sans modale ni redirection;
- creation implicite des nouveaux medicaments a la validation finale;
- formulaire remis a zero apres ajout d'une ligne;
- modification/suppression de lignes avant validation;
- validation finale de toute la livraison;
- affichage de l'historique des approvisionnements.

## Verification

Checks executes:
- `python manage.py check`
- `python manage.py makemigrations --check --dry-run`
- import Django des vues/services stock;
- `npm run lint`
- `npm run build`

Limite locale:
- `python manage.py test stock` trouve les tests mais ne peut pas creer la base de test PostgreSQL: l'utilisateur local n'a pas le droit `CREATE DATABASE`.
