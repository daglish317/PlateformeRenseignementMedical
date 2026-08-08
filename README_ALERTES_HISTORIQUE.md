# Alertes et Historique - SantéProx

## Objectif

Cette phase aligne les modules `Alertes` et `Historique` sur le modèle pharmacie SantéProx.

Les deux modules sont passifs :

- `Alertes` surveille les autres modules et génère uniquement des alertes système.
- `Historique` conserve uniquement les événements métier majeurs.
- Aucun utilisateur ne peut créer, modifier ou supprimer manuellement une alerte ou un événement historique.

## Alertes

### Règles métier

Les alertes sont générées automatiquement par `AlertesService`.

Alertes opérationnelles, visibles par `GESTIONNAIRE` et `PROPRIETAIRE` :

- `STOCK_FAIBLE` : stock disponible inférieur ou égal au seuil d'alerte.
- `RUPTURE_STOCK` : stock disponible égal à zéro.

Alertes de supervision, visibles uniquement par `PROPRIETAIRE` :

- `RETOURS_CAISSE_ANORMAUX` : volume journalier de retours caisse inhabituel.
- `VENTES_ANNULEES_ANORMALES` : volume journalier d'annulations de vente inhabituel.

Le stock disponible est calculé avec la quantité physique moins la quantité réservée. Les alertes stock sont résolues automatiquement quand la situation revient à la normale. Les alertes de supervision sont résolues automatiquement quand le volume du jour n'est plus anormal.

### Etat de lecture

L'état lu/non lu est propre à chaque utilisateur via `lu_par`.

La seule action utilisateur autorisée sur une alerte est :

- marquer l'alerte comme lue pour son propre compte.

### Accès

- `GESTIONNAIRE` : liste, résumé, recherche, filtres, détail des alertes opérationnelles, marquage comme lue.
- `PROPRIETAIRE` : liste, résumé, recherche, filtres, détail de toutes les alertes, recherche par utilisateur concerné, export PDF/Excel.
- `CAISSIER` : aucun accès.

### Endpoints

- `GET /api/alertes/?structure_id=...`
- `GET /api/alertes/resume/?structure_id=...`
- `GET /api/alertes/<id>/`
- `POST /api/alertes/<id>/marquer-lue/`
- `GET /api/alertes/exporter/pdf/?structure_id=...`
- `GET /api/alertes/exporter/excel/?structure_id=...`

Filtres supportés :

- `filtre=critiques`
- `filtre=non_lues`
- `filtre=stock_faible`
- `filtre=rupture`
- `filtre=supervision`
- `recherche=...`
- `recherche_utilisateur=...` pour propriétaire.

## Historique

### Règles métier

Le journal historique conserve uniquement les événements majeurs demandés :

- `APPROVISIONNEMENT_CREE`
- `INVENTAIRE_GENERE`
- `CAISSE_RETOUR`

Les opérations ordinaires ne sont pas historisées ici :

- ventes ordinaires,
- paiements,
- impressions de reçu,
- recherches de médicaments,
- consultations d'inventaire.

### Génération automatique

Les événements sont générés par les modules métier :

- `stock.services.ApprovisionnementService` enregistre `APPROVISIONNEMENT_CREE`.
- `inventaires.services.InventaireService` enregistre `INVENTAIRE_GENERE`.
- `ventes.services.VenteService` enregistre `CAISSE_RETOUR`.

Chaque événement conserve la structure, l'utilisateur, le rôle au moment de l'action, la date/heure, les données métier utiles et un index de recherche.

### Accès

- `GESTIONNAIRE` : résumé, liste, recherche, filtres, détail pour sa structure.
- `PROPRIETAIRE` : résumé, liste, recherche, filtres, détail et export PDF/Excel pour ses structures.
- `CAISSIER` : aucun accès.

### Endpoints

- `GET /api/historique/?structure_id=...`
- `GET /api/historique/resume/?structure_id=...`
- `GET /api/historique/<id>/`
- `GET /api/historique/exporter/pdf/?structure_id=...`
- `GET /api/historique/exporter/excel/?structure_id=...`

Filtres supportés :

- `recherche=...`
- `type=APPROVISIONNEMENT_CREE`
- `type=INVENTAIRE_GENERE`
- `type=CAISSE_RETOUR`
- `periode=aujourdhui`
- `periode=semaine`
- `periode=mois`
- `periode=personnalisee&date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD`

## Frontend

Routes gestionnaire :

- `/pharmacy/alertes`
- `/pharmacy/history`

Routes propriétaire :

- `/owner/alertes`
- `/owner/history`

Le propriétaire sélectionne la pharmacie concernée avant consultation ou export. Le gestionnaire utilise sa structure active.

## Vérification

Commandes à exécuter après modification :

```powershell
cd backend
..\backend\env\Scripts\python.exe manage.py check
..\backend\env\Scripts\python.exe manage.py makemigrations --check --dry-run
..\backend\env\Scripts\python.exe manage.py test alertes historique
```

```powershell
cd frontend
npm run lint
npm run build
```

Note : les tests Django peuvent échouer dans cet environnement si l'utilisateur PostgreSQL n'a pas le droit `CREATE DATABASE`. Dans ce cas, l'échec vient de l'environnement de test, pas nécessairement du code applicatif.
