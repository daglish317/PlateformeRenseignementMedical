# Statistiques - SantéProx

## Objectif

Le module `Statistiques` est la couche d'analyse du système pharmacie SantéProx.

Il permet au propriétaire d'analyser l'activité d'une pharmacie sur une période donnée à partir des données réelles déjà enregistrées dans les modules métier.

Le module est strictement en lecture :

- aucune création de vente ;
- aucune modification de stock ;
- aucune modification d'approvisionnement ;
- aucune action caisse ;
- aucune modification d'inventaire.

## Accès

Le contrôle d'accès est appliqué côté backend.

- `PROPRIETAIRE` : accès complet en lecture, filtres, comparaison, détails, export PDF/Excel.
- `GESTIONNAIRE` : aucun accès aux endpoints statistiques.
- `CAISSIER` : aucun accès aux endpoints statistiques.

Les informations financières ne sont jamais seulement cachées dans l'interface. Elles sont protégées par les vues backend avec `proprietaire_required` et une vérification d'appartenance propriétaire à la structure.

## Périodes

Périodes rapides supportées :

- aujourd'hui ;
- hier ;
- cette semaine ;
- semaine précédente ;
- ce mois ;
- mois précédent ;
- cette année ;
- période personnalisée.

Chaque statistique est recalculée selon la période sélectionnée. Quand c'est possible, une période précédente équivalente est résolue pour calculer les variations.

## Sections fonctionnelles

### Vue générale

Synthèse de l'activité :

- ventes validées ;
- produits vendus ;
- évolution des ventes ;
- approvisionnements enregistrés ;
- quantités reçues ;
- valeur du stock ;
- références disponibles ;
- ruptures ;
- stocks faibles ;
- paiements validés ;
- retours caisse ;
- annulations avant paiement.

### Analyse des ventes

Les ventes sont basées uniquement sur les ventes `PAYEE`.

Sont disponibles :

- nombre de ventes encaissées ;
- nombre de produits vendus ;
- séries lisibles pour graphiques ;
- périodes les plus actives ;
- périodes les moins actives ;
- évolution par rapport à la période précédente.

### Produits vendus

Classement des produits selon les quantités réellement vendues.

Les retours caisse sont déduits du classement lorsque les lignes de retour sont disponibles.

### Approvisionnements

Analyse des approvisionnements enregistrés :

- nombre d'approvisionnements ;
- quantité totale reçue ;
- coût d'achat total ;
- évolution ;
- périodes de forte réception ;
- produits fréquemment réapprovisionnés.

### Stock

Analyse du stock actuel :

- références disponibles ;
- ruptures ;
- stocks faibles ;
- répartition par type d'article ;
- produits avec le plus de ruptures ;
- valeur d'achat du stock ;
- valeur potentielle de vente.

La valeur d'achat et la valeur potentielle de vente sont séparées.

### Caisse

Analyse caisse :

- paiements validés ;
- montant encaissé ;
- répartition par mode de paiement ;
- retours caisse ;
- fréquence des retours ;
- annulations avant paiement.

### Financier

La partie financière est strictement propriétaire.

Elle se base uniquement sur les paiements réellement validés en caisse :

- chiffre d'affaires brut ;
- retours caisse ;
- chiffre d'affaires net ;
- panier moyen ;
- coût des marchandises vendues ;
- bénéfice brut ;
- marge brute ;
- répartition par mode de paiement.

Une vente préparée puis annulée ou expirée n'est pas considérée comme une recette.

### Comparaison

Comparaison de la période actuelle avec la période précédente :

- ventes ;
- approvisionnements ;
- ruptures ;
- retours caisse ;
- variation en pourcentage.

Les filtres actifs sont appliqués aux calculs de comparaison.

## Filtres

Filtres supportés côté backend et frontend :

- période ;
- produit ;
- type d'article ;
- numéro ou identifiant de vente ;
- numéro ou identifiant d'approvisionnement ;
- mode de paiement caisse.

Les helpers backend acceptent explicitement les chemins de champs selon le modèle filtré pour éviter les erreurs entre `Vente`, `Paiement`, `LigneVente`, `RetourCaisse` et `Approvisionnement`.

## Endpoints

- `GET /api/statistiques/generale/`
- `GET /api/statistiques/ventes/`
- `GET /api/statistiques/produits/`
- `GET /api/statistiques/approvisionnements/`
- `GET /api/statistiques/stock/`
- `GET /api/statistiques/caisse/`
- `GET /api/statistiques/financier/`
- `GET /api/statistiques/comparaison/`
- `GET /api/statistiques/details/`
- `GET /api/statistiques/exporter/pdf/`
- `GET /api/statistiques/exporter/excel/`

Chaque endpoint exige `structure_id`.

## Frontend

Route propriétaire :

- `/owner/statistics`

La page propriétaire permet :

- sélection de pharmacie ;
- sélection de période ;
- filtre produit ;
- filtre type d'article ;
- filtre vente ;
- filtre approvisionnement ;
- filtre mode de paiement ;
- navigation par onglets ;
- export PDF/Excel.

Route gestionnaire :

- `/pharmacy/statistics`

Cette route n'expose aucune donnée statistique financière et affiche seulement un message d'accès réservé.

## Vérification

Vérifications effectuées après correction :

```powershell
cd backend
..\backend\env\Scripts\python.exe manage.py check
..\backend\env\Scripts\python.exe manage.py makemigrations --check --dry-run
```

```powershell
cd frontend
npm run lint
```

Résultat :

- Django system check : OK.
- Migrations : aucune migration détectée.
- ESLint : 0 erreur, 12 avertissements existants hors module statistiques.

Limites d'environnement :

- `npm run build` et l'import ciblé Django ont été rejetés par l'environnement avec `Crédits insuffisants` pendant cette phase.
- Les tests Django complets peuvent aussi être bloqués par le droit PostgreSQL `CREATE DATABASE` si l'utilisateur de base de données n'a pas ce privilège.
