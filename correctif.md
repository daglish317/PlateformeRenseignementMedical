Toutes les exigences décrites dans cette spécification doivent être implémentées correctement.

L'objectif n'est pas de reconstruire les modules existants, mais d'améliorer et de corriger uniquement les parties explicitement concernées.

Avant toute modification, analyser l'implémentation existante et identifier précisément les fichiers, services, hooks, composants, types, stores et logiques métier concernés.

Règles obligatoires :

1. Ne modifier que les fichiers réellement concernés par une exigence.
2. Ne pas supprimer ou réécrire une fonctionnalité existante qui n'est pas concernée.
3. Conserver l'architecture et les conventions déjà utilisées dans le projet.
4. Réutiliser les composants, hooks, services et types existants lorsqu'ils répondent déjà au besoin.
5. Éviter les doublons et les nouvelles abstractions inutiles.
6. Réduire la complexité au maximum.
7. Conserver une séparation claire entre :
   - logique métier ;
   - accès aux données ;
   - état local/global ;
   - interface utilisateur.
8. Ne jamais simuler ou inventer une donnée qui doit provenir du backend.
9. Respecter strictement les permissions existantes entre PROPRIETAIRE, GESTIONNAIRE et CAISSIER.
10. Toute modification affectant le stock doit rester cohérente avec les modules Approvisionnement, Vente et Caisse.
11. Toute opération sensible doit rester traçable.
12. Les changements doivent être implémentés progressivement par petits blocs indépendants afin de pouvoir tester chaque modification sans déstabiliser les autres modules.

A la fin global de toutes les corrections verifier que tout fonctionne normalement , vérifier que les fonctionnalités existantes non concernées continuent de fonctionner.

MODULE : APPROVISIONNEMENT — EN-TÊTE

Modifier uniquement la partie correspondant à la création d'un approvisionnement.

Un approvisionnement représente une livraison reçue par la pharmacie.

L'en-tête de l'approvisionnement doit obligatoirement contenir toutes les informations définies comme obligatoires pour identifier la livraison.

Le formulaire doit notamment demander :

- montant total indiqué sur le bon de livraison ;
-le numero du bon de livraison (il est deja present juste remplacer le nom)
- date de l'approvisionnement ;
- informations du bon de livraison déjà prévues par le système.

Tous les champs définis comme obligatoires pour le bon d'approvisionnement doivent être réellement obligatoires dans l'interface et dans la validation.

Le système ne doit pas permettre de considérer un approvisionnement comme valide si une information obligatoire manque.

Le montant total indiqué dans l'en-tête devient la référence de contrôle du montant du bon de livraison et signaler a la fin si tout est corecte ou pas dans les prix.

Ne pas ajouter de nouveaux champs optionnels qui n'ont pas été validés dans les spécifications précédentes.

MODULE : APPROVISIONNEMENT — TVA / PRIX DE VENTE

Pour chaque médicament ajouté à un approvisionnement :

- le prix d'achat est obligatoire ;
- le prix de vente est renseigné lorsque le produit possède un prix de vente déterminé ;
- le produit peut être marqué comme étant soumis à la TVA.

RÈGLE ABSOLUE :

Un produit marqué TVA ne peut pas posséder de prix de vente renseigné.

Comportement de l'interface :

1. Le gestionnaire peut initialement renseigner un prix de vente.
2. S'il active ensuite l'option TVA :
   - le champ prix de vente doit devenir désactivé ;
   - la valeur précédemment saisie ne doit plus être utilisée ;
   - le système doit considérer le prix de vente comme non renseigné pour ce produit.
3. Si la TVA est désactivée :
   - le champ prix de vente redevient disponible ;
   - le prix de vente doit être renseigné avant validation.

La logique métier doit également être contrôlée côté validation afin qu'un utilisateur ne puisse pas contourner cette règle uniquement en manipulant l'interface.

Il ne doit jamais être possible d'enregistrer un produit avec simultanément :
- TVA = active ;
- prix de vente = renseigné.

MODULE : APPROVISIONNEMENT — SAISIE INTELLIGENTE

Lorsqu'un gestionnaire saisit le nom d'un médicament ou produit déjà présent dans les données de la pharmacie, le système doit proposer les produits correspondants.

Lorsque le gestionnaire sélectionne un produit existant :

TOUS les champs connus doivent être automatiquement récupérés et affichés dans le formulaire.

Cela inclut notamment :

- nom ;
- type ;
- prix d'achat ;
- prix de vente lorsque applicable ;
- statut TVA lorsque applicable ;
- autres informations déjà enregistrées et prévues par le modèle existant.

La quantité doit également être récupérée selon les informations disponibles pour ce produit.

La quantité existante ne doit cependant pas être confondue avec la quantité ajoutée par la nouvelle livraison.

Le gestionnaire doit clairement distinguer :

QUANTITÉ ACTUELLE EN STOCK
et
QUANTITÉ AJOUTÉE PAR CET APPROVISIONNEMENT.

Lorsqu'un produit existe déjà, le gestionnaire doit pouvoir modifier les valeurs qui ont réellement changé pour cette nouvelle livraison, sans devoir ressaisir toutes les informations déjà connues.

Ne pas créer de nouvelle fenêtre modale pour modifier un produit existant.

Le même formulaire d'approvisionnement doit être utilisé(se qui est deja le cas).


MODULE : APPROVISIONNEMENT — STOCK AVANT VALIDATION

Dans la liste des médicaments saisis avant validation de l'approvisionnement, remplacer l'affichage générique "Quantité" par une distinction claire entre :

- quantité présente dans le stock avant l'approvisionnement ;
- quantité ajoutée par l'approvisionnement.

La quantité présente dans le stock doit être affichée en lecture seule.

Elle représente l'état réel du stock au moment où le produit est consulté ou ajouté à l'approvisionnement.

La quantité ajoutée est la quantité provenant de la livraison actuelle.

Le système doit afficher clairement ces deux informations afin que le gestionnaire puisse comprendre l'effet de l'approvisionnement.

Exemple :

Produit : Paracétamol
Stock actuel : 25
Quantité ajoutée : 50

Le résultat attendu après validation est :

Stock final = 75

La quantité actuelle ne doit jamais être modifiée directement par le gestionnaire dans cette interface.


MODULE : APPROVISIONNEMENT — CONTRÔLE DU MONTANT

Après la saisie des produits et avant la validation définitive de l'approvisionnement, le système doit comparer :

1. le montant total déclaré dans l'en-tête du bon de livraison ;
2. le montant total calculé à partir des lignes de produits.

Pour chaque ligne :

montant de la ligne = prix d'achat × quantité ajoutée

Le système calcule ensuite :

montant calculé de l'approvisionnement =
somme des montants de toutes les lignes.

Le système compare ce montant avec le montant total déclaré sur le bon.

CAS 1 — Les montants correspondent

Afficher clairement que le contrôle est correct.

L'approvisionnement peut poursuivre son workflow normal de validation.

CAS 2 — Les montants ne correspondent pas

Bloquer la validation définitive de l'approvisionnement.

Afficher une erreur claire indiquant que :

- le montant déclaré dans l'en-tête ;
- le montant calculé à partir des produits ;

ne correspondent pas.

Le gestionnaire doit corriger les données avant de pouvoir poursuivre.

Cette vérification doit être considérée comme une règle métier et ne doit pas dépendre uniquement d'un calcul effectué dans l'interface ainsi le gestionnaire pourra corrigé les données des lignes concerner par le probleme en le modifiant ou suppriment.

MODULE : APPROVISIONNEMENT — DOCUMENT

Après ou pendant la consultation d'un approvisionnement enregistré, prévoir :

- bouton Imprimer ;
- bouton Exporter Excel.

L'impression doit représenter les informations de l'approvisionnement de manière lisible.

L'export Excel doit représenter les données réellement enregistrées dans l'approvisionnement.

Ne pas générer un export contenant uniquement les données actuellement affichées dans un filtre si cela conduit à perdre des informations.

Le document doit permettre d'identifier clairement :

- l'approvisionnement ;
- ses informations d'en-tête ;
- ses produits ;
- quantités ;
- prix d'achat ;
- prix de vente lorsqu'applicable ;
- TVA lorsqu'applicable ;
- montants ;
- informations nécessaires à la traçabilité(donc toute les colones presente avant la validation du bon de livraison).

MODULE : APPROVISIONNEMENT — HISTORIQUE

Dans la liste des approvisionnements enregistrés :

1. Les approvisionnements les plus récents doivent toujours apparaître en premier.
2. Chaque approvisionnement doit disposer d'une action "Voir les détails".
3. Cette action ne doit PAS ouvrir une fenêtre modale.
4. Les détails doivent se déployer directement dans la même page.
5. Le détail doit afficher les lignes correspondant uniquement à l'approvisionnement sélectionné.
6. Un seul niveau de détail doit rester lisible et facilement refermable.

La consultation doit permettre de retrouver toutes les informations enregistrées lors de l'approvisionnement.

Prévoir également :

- Imprimer ;
- Exporter Excel.

Les opérations de consultation ne doivent modifier aucune donnée du stock.

MODULE : STOCK — PERMISSIONS

Le GESTIONNAIRE ne doit pas pouvoir supprimer un médicament du stock.

Le GESTIONNAIRE ne doit pas pouvoir modifier directement les informations sensibles du stock lorsque cette modification relève d'une action réservée au propriétaire.

Le PROPRIETAIRE possède les permissions supplémentaires déjà définies pour la gestion du stock.

Lorsqu'un PROPRIETAIRE effectue une modification ou une suppression autorisée :

1. l'action doit être enregistrée ;
2. l'auteur doit être identifiable ;
3. la date et l'heure doivent être conservées ;
4. l'action doit être traçable ;
5. l'événement doit être rendu visible dans le système d'alertes lorsque cela correspond à la règle d'alerte définie.

Ne jamais simplement supprimer ou modifier silencieusement une donnée sensible.

MODULE : STOCK — TYPE DU PRODUIT

Corriger le comportement actuel qui affiche systématiquement MEDICAMENT comme type.

Le type affiché dans le stock doit correspondre au type réellement enregistré lors de l'approvisionnement.

Si un produit a été enregistré comme :

- COMPRIME ;
- POMMADE ;
- SIROP ;
- CREME ;
- ou un autre type déjà prévu par le système ;

le stock doit afficher le type réellement enregistré.

Ne pas remplacer automatiquement la valeur par MEDICAMENT.

Ne pas créer de nouveaux types qui ne sont pas déjà prévus par le système.

La correction doit être effectuée à la source de la donnée et dans son affichage afin que le type reste cohérent entre :

Approvisionnement → Stock → Vente → autres modules utilisant le produit.

MODULE : STOCK — STOCK FAIBLE

Un médicament est considéré comme ayant un stock faible lorsque sa quantité actuelle est strictement inférieure à 10.

Règle :

quantité < 10 → STOCK FAIBLE

Exemples :

10 → pas de stock faible
9 → stock faible
5 → stock faible
1 → stock faible
0 → rupture

Le système doit compter tous les médicaments répondant à cette condition pour calculer le nombre total de stocks faibles.

Ne pas limiter le calcul aux médicaments récemment modifiés.

Ne pas utiliser uniquement les alertes déjà générées pour déterminer le nombre actuel de stocks faibles.

Le compteur doit représenter l'état réel actuel du stock.

MODULE : STOCK / VENTE / CAISSE — SYNCHRONISATION

La validation d'un paiement par la CAISSE doit entraîner la mise à jour effective du stock correspondant à la vente.

Workflow :

GESTIONNAIRE
↓
Création de la vente
↓
Transmission à la CAISSE
↓
CAISSIER valide le paiement
↓
VENTE VALIDÉE
↓
STOCK MIS À JOUR

La quantité vendue doit être déduite du stock au moment défini par la validation effective de la vente.

Une vente qui n'est pas validée par la caisse ne doit pas être considérée comme une vente définitivement consommée du stock.

CAS ANNULATION AVANT VALIDATION :

Aucune diminution définitive du stock ne doit être conservée.

CAS ANNULATION / RETOUR APRÈS VALIDATION :

Le système doit appliquer le workflow de retour en caisse déjà défini et rétablir la quantité correspondante dans le stock lorsque le retour est effectivement validé.

La synchronisation doit être réalisée de manière transactionnelle et sécurisée.

Une erreur pendant la validation ne doit pas laisser le système dans un état incohérent où :
- la caisse indique une vente validée ;
- mais le stock n'a pas été correctement mis à jour.

Inversement, le stock ne doit pas être modifié alors que la vente n'est pas réellement validée.

Le stock doit toujours être recalculé à partir de l'état métier réellement enregistré côté serveur et non à partir d'une simple modification locale du frontend.

MODULE : PÉREMPTION

Créer un module dédié à la consultation des produits proches de leur date de péremption.

Le module ne doit pas modifier le stock.

Il doit uniquement fournir une vue spécialisée des produits concernés.

Un produit est considéré comme proche de la péremption lorsqu'il reste trois mois ou moins avant sa date de péremption.

Le module doit afficher uniquement les produits répondant à cette condition.

Pour chaque produit concerné, afficher au minimum :

- nom ;
- type ;
- quantité actuelle ;
- date de péremption ;
- temps restant avant péremption.

Le temps restant doit être calculé à partir de la date actuelle et de la date de péremption.

Exemple :

Date de péremption : 15 novembre
Date actuelle : 15 août

Afficher :

"Expire dans 3 mois"

Le système doit également gérer les produits dont la date de péremption est déjà dépassée.

Le module est un module de consultation et d'information.

Il ne doit pas supprimer automatiquement un produit et ne doit pas modifier sa quantité.

Les permissions doivent respecter les rôles déjà définis pour la gestion de la pharmacie.

MODULE : NAVIGATION / NOTIFICATIONS NON LUES

Chaque élément de navigation pouvant contenir des informations nouvelles doit posséder un état permettant de déterminer s'il contient du contenu non consulté.

Deux états sont nécessaires :

- non consulté ;
- consulté.

Lorsqu'une nouvelle information pertinente apparaît :

état = non consulté

Le menu correspondant affiche son indicateur visuel.

Le nombre correspondant doit être intégré au compteur global de la cloche du dashboard lorsque l'information doit être comptabilisée comme notification non lue.

Lorsqu'un utilisateur ouvre réellement la page concernée :

état = consulté

Le marqueur visuel du menu doit disparaître.

Le compteur correspondant doit être retiré du compteur global de la cloche.

Important :

Entrer dans une page doit marquer comme consultées uniquement les notifications/informations effectivement concernées par cette page.

Ne pas supprimer globalement toutes les notifications simplement parce qu'une page a été ouverte.

Le système doit conserver une distinction claire entre :

- contenu disponible ;
- contenu non consulté ;
- contenu consulté.

MODULE : ALERTES — NAVIGATION

Le module Alertes doit disposer du même comportement de signalement que les autres modules concernés.

Lorsqu'une nouvelle alerte pertinente est créée :

- le menu Alertes doit afficher son indicateur ;
- le compteur correspondant doit être intégré au système global de notifications du dashboard.

Lors de l'ouverture du module Alertes :

- les alertes correspondantes passent dans l'état consulté selon les règles de lecture définies ;
- l'indicateur du menu est mis à jour ;
- le compteur global est recalculé.

Les alertes ne doivent pas être supprimées simplement parce qu'elles ont été consultées.

Consultée ≠ supprimée.

La conservation de l'historique des alertes doit rester indépendante de leur statut de lecture.


MODULE : VENTE — BÉNÉFICIAIRE

Ajouter un champ optionnel permettant d'enregistrer le nom du bénéficiaire de l'achat.

Le champ est facultatif au niveau de la saisie initiale par le GESTIONNAIRE et par le caissier.

Le gestionnaire peut :

- renseigner le bénéficiaire ;
- ou laisser le champ vide.

Si le bénéficiaire n'a pas été renseigné par le gestionnaire, le CAISSIER doit pouvoir le renseigner au moment de la prise en charge du paiement.

si le bénéficiaire a été renseigner Le système doit conserver le bénéficiaire enregistré avec la vente.

Le CAISSIER ne doit pas être obligé de ressaisir un bénéficiaire déjà renseigné par le gestionnaire.

Le bénéficiaire ne doit pas être utilisé pour modifier les droits d'accès du gestionnaire ou du caissier.


MODULE : CAISSE / VENTES — RECHERCHE DES REÇUS

Le système doit permettre de retrouver une vente ou un reçu déjà enregistré.

Les critères de recherche doivent inclure :

- date ;
- nom du bénéficiaire.
donc le system dois pouvoir faire une recherche par nom a une date donné.
La recherche doit pouvoir être utilisée par les utilisateurs autorisés, notamment :

- GESTIONNAIRE ;
- CAISSIER.

Les résultats doivent respecter strictement les permissions de chaque rôle.

La recherche ne doit pas exposer les recettes globales de la pharmacie au gestionnaire ou au caissier.

La consultation d'un reçu individuel ne doit pas donner accès aux recettes cumulées de la journée ou d'une période.

MODULE : FACTURES

Ajouter un module permettant de produire une facture correspondant à l'achat d'un client.

Une facture doit être créée à partir d'une vente réellement enregistrée dans le système.

La facture doit reprendre les informations de la vente concernée et ne doit pas recréer manuellement une seconde liste de produits.

Elle doit notamment pouvoir reprendre :

- bénéficiaire/client lorsqu'il est renseigné ;
- produits achetés ;
- quantités ;
- prix ;
- montants ;
- total ;
- informations nécessaires à l'identification de la vente.

La facture doit rester liée à la vente d'origine.

Une facture ne doit pas modifier le stock.

Une facture ne doit pas créer une nouvelle vente.

La génération de facture doit respecter les permissions du rôle utilisateur.

La facture doit pouvoir être consultée et produite à partir d'une vente autorisée.

NB la facture peut etre imprimer en pdf ou telechargeable

MODULE : STATISTIQUES — PRODUITS LES PLUS VENDUS

Le système doit permettre d'identifier les produits les plus vendus.

Le calcul doit utiliser uniquement les ventes réellement validées.

Une vente annulée ou non validée ne doit pas être comptabilisée comme une vente définitive.

Pour chaque produit, le système doit pouvoir déterminer :

- nombre total d'unités vendues ;
- période correspondante.

La statistique doit permettre de sélectionner différentes périodes.

Exemples :

- jour ;
- semaine ;
- mois ;
- période personnalisée.

Le système doit pouvoir comparer ou afficher les produits selon le nombre d'unités vendues pendant la période sélectionnée.

Les données statistiques ne doivent pas modifier le stock.

Le module Statistiques doit respecter la restriction déjà définie :

les données globales de recettes et les statistiques financières restent réservées au PROPRIETAIRE.


COHÉRENCE INTER-MODULES

Les corrections doivent être implémentées en conservant les relations métier suivantes :

APPROVISIONNEMENT
        ↓
STOCK
        ↓
VENTE
        ↓
CAISSE
        ↓
VENTE VALIDÉE
        ↓
STOCK MIS À JOUR
        ↓
STATISTIQUES

Les données de péremption proviennent des informations enregistrées lors de l'approvisionnement.

Les alertes de stock sont déterminées à partir de l'état réel du stock.

Les statistiques de vente sont déterminées à partir des ventes réellement validées.

Les reçus et factures doivent rester liés à leur vente d'origine.

Les actions sensibles du propriétaire doivent rester traçables.

Aucun module ne doit créer une copie indépendante d'une donnée qui existe déjà dans un autre module lorsqu'une relation avec la donnée originale peut être conservée.

L'objectif est de maintenir une seule source cohérente pour chaque information métier importante.

Toute modification doit être vérifiée contre les workflows existants afin d'éviter les incohérences entre :
- stock ;
- approvisionnement ;
- vente ;
- caisse ;
- alertes ;
- péremption ;
- inventaire ;
- historique ;
- statistiques ;
- facturation.