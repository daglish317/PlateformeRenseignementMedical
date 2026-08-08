# Module Inventaire - Pharmacie SanteProx

## Objectif

Le module inventaire produit une photographie historique du stock d'une pharmacie a un instant precis. Il sert a consulter l'etat du stock, a garder une trace des inventaires generes et a permettre au proprietaire de superviser ses pharmacies.

Regle fondamentale: l'inventaire observe le stock. Il ne cree aucun mouvement, ne modifie aucune quantite, ne supprime aucun medicament et ne remplace pas les flux metier d'approvisionnement, de vente ou de caisse.

## Roles

- `GESTIONNAIRE`: peut acceder au module, generer un inventaire pour sa structure, consulter l'historique, rechercher, filtrer et exporter.
- `PROPRIETAIRE`: peut consulter les inventaires des structures dont il est proprietaire et telecharger les rapports. Il ne peut pas generer, modifier ou supprimer un inventaire.
- `CAISSIER`: n'a aucun acces au module inventaire.

## Backend

Application Django: `backend/inventaires/`

Modeles:
- `Inventaire`: document historique lie a une structure, a l'utilisateur createur, a son role au moment de la generation et a un numero unique par structure.
- `InventaireLigne`: ligne denormalisee qui conserve le nom, la forme, les quantites, le seuil et le statut au moment de la generation.

Service principal:
- `InventaireService.generer(structure, utilisateur)` capture les medicaments et leur stock courant sans modifier `StockItem`, `StockMovement` ou `Medicament`.

Endpoints:
- `GET /api/inventaires/?structure_id=<uuid>`: liste des inventaires d'une structure.
- `POST /api/inventaires/generer/`: genere un inventaire pour un gestionnaire. Corps attendu: `{ "structure_id": "<uuid>" }`.
- `GET /api/inventaires/<uuid>/`: detail d'un inventaire avec lignes.
- `GET /api/inventaires/<uuid>/?recherche=<texte>`: recherche par nom, forme ou libelle de statut.
- `GET /api/inventaires/<uuid>/?statut=DISPONIBLE|STOCK_FAIBLE|RUPTURE`: filtre par statut.
- `GET /api/inventaires/<uuid>/pdf/`: export PDF.
- `GET /api/inventaires/<uuid>/excel/`: export Excel.

## Calculs

Quantites:
- Quantite physique: `StockItem.quantite`.
- Quantite reservee: `StockItem.quantite_reservee`.
- Quantite disponible: `max(quantite - quantite_reservee, 0)`.

Statuts:
- `RUPTURE`: quantite disponible egale a `0`.
- `STOCK_FAIBLE`: quantite disponible superieure a `0` et inferieure ou egale au seuil d'alerte.
- `DISPONIBLE`: quantite disponible strictement superieure au seuil d'alerte.

Les equipements et consommables ne sont pas inclus dans l'inventaire pharmacie; seules les lignes de type medicament sont capturees.

## Frontend

Module React/Next: `frontend/src/features/inventaire/`

Routes:
- `/pharmacy/inventory`: dashboard gestionnaire pharmacie, avec generation et historique.
- `/owner/inventaires`: supervision proprietaire, selection de pharmacie et consultation/export.

Fonctionnalites disponibles:
- Generation depuis le dashboard gestionnaire.
- Historique des inventaires par structure.
- Resume general: total produits, disponibles, stock faible, ruptures.
- Detail des lignes.
- Recherche par produit, forme ou statut.
- Filtre par statut.
- Export PDF et Excel.

## Verification

Checks executes:
- `python manage.py check`
- `npm run lint`
- `npm run build`

Limite de verification locale:
- `python manage.py test inventaires` est bloque par PostgreSQL car l'utilisateur local n'a pas le droit `CREATE DATABASE` pour creer la base de test.

## Notes d'integration

- `reportlab==5.0.0` est requis pour l'export PDF.
- `openpyxl` est utilise pour l'export Excel.
- Les inventaires sont immuables par conception: les lignes sauvegardees restent identiques meme si le stock change ensuite.
