# Correctifs fonctionnels - correctif.md

Ce fichier resume les corrections implementees pour la specification `correctif.md`.

## Approvisionnement

- Ajout du montant total declare dans l'en-tete de l'approvisionnement.
- Validation frontend et backend du montant declare contre le total calcule des lignes.
- Renommage fonctionnel du numero de bon de livraison dans le formulaire.
- Champs obligatoires renforces dans le formulaire et dans les serializers.
- Regle TVA / prix de vente appliquee cote interface et cote serveur :
  - TVA active interdit un prix de vente ;
  - TVA inactive impose un prix de vente.
- Saisie intelligente conservee sur le formulaire existant :
  - recuperation des informations connues du medicament ;
  - affichage du stock actuel en lecture seule ;
  - distinction stock avant, quantite ajoutee et stock final.
- Historique des approvisionnements enrichi :
  - details deployes dans la page, sans modale ;
  - lignes de l'approvisionnement selectionne uniquement ;
  - actions impression PDF et export Excel.

## Stock

- Le gestionnaire ne peut plus supprimer un stock sensible.
- La suppression autorisee par le proprietaire est tracee dans l'historique avec l'evenement `STOCK_SUPPRIME`.
- Le stock affiche la forme pharmaceutique reelle issue des medicaments approvisionnes au lieu d'afficher systematiquement `MEDICAMENT`.
- Le stock faible respecte la regle stricte :
  - `0` = rupture ;
  - `1` a `9` = stock faible ;
  - `10` et plus = pas de stock faible.

## Vente, caisse, recus et factures

- Ajout du beneficiaire facultatif via le champ existant `nom_client`.
- Le gestionnaire peut renseigner le beneficiaire avant l'envoi a la caisse.
- Le caissier peut renseigner le beneficiaire au paiement uniquement si le gestionnaire ne l'a pas deja renseigne.
- La liste des paiements affiche le beneficiaire.
- La facture affiche le beneficiaire.
- Le recu PDF reprend le beneficiaire lorsque disponible.
- La recherche des paiements accepte maintenant :
  - texte : numero de vente, numero de facture, nom beneficiaire, telephone ;
  - date de paiement via `date_paiement`.
- La recherche reste limitee aux ventes autorisees par la structure et ne retourne pas de statistiques globales.

## Peremption

- Ajout d'un module pharmacie dedie a la consultation des produits expires ou proches de la peremption.
- Ajout de la route frontend `/pharmacy/peremption`.
- Ajout de l'endpoint backend de consultation par structure.
- Le module est en lecture seule et ne modifie pas le stock.

## Notifications et alertes

- Le compteur de notifications reste groupe par `nav_item`.
- `read-all` peut maintenant marquer uniquement un `nav_item` precis comme lu.
- La page Notifications marque seulement `notifications` comme consulte.
- Les nouvelles alertes generent une notification de navigation `alertes` pour les responsables de structure.
- L'ouverture des pages Alertes marque seulement le menu `alertes` comme consulte.
- Les alertes metier ne sont pas supprimees et leur lecture detaillee reste geree par `lu_par`.

## Statistiques

- Verification effectuee : les produits vendus et statistiques de vente s'appuient deja sur les ventes `PAYEE`.
- Les periodes existantes utilisent les bornes sur `validee_le` pour les ventes validees.
- Aucune modification structurelle n'a ete necessaire sur ce module.

## Verifications executees

- Backend :
  - `python manage.py check` : OK.
  - `python manage.py makemigrations --check --dry-run` : OK.
  - `python -m py_compile ...` sur les fichiers backend modifies : OK.
- Frontend :
  - `npm run lint` : OK, avec avertissements existants.
  - `npm run build` : OK.

## Limite de verification

Les tests Django complets n'ont pas pu se terminer car PostgreSQL possede deja une base `test_santeprox_db` existante. Sans suppression interactive, Django bloque la creation de la base de test ; avec `--keepdb`, l'execution a expire avant la fin.

