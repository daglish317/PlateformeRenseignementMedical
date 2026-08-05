Gestion des pharmacies sur SantéProx : pourquoi avons-nous changé notre fonctionnement ?

Au départ, notre plateforme fonctionnait selon un modèle relativement classique.

Lorsqu'une nouvelle pharmacie souhaitait rejoindre SantéProx, c'était l'administrateur SantéProx qui créait directement le compte du gestionnaire de la pharmacie.

Le workflow était le suivant :

Administrateur SantéProx
        │
        ▼
Création d'un compte Gestionnaire
        │
        ▼
Invitation envoyée
        │
        ▼
Le gestionnaire configure la pharmacie
        │
        ▼
Le gestionnaire administre toute la pharmacie

Cette approche fonctionne techniquement.

Cependant, après avoir étudié plus en profondeur le fonctionnement réel des pharmacies, nous avons identifié une faiblesse importante.

Dans une pharmacie, la personne qui possède l'établissement n'est pas toujours celle qui utilise quotidiennement le logiciel de gestion.

Très souvent :

le propriétaire investit dans la pharmacie ;
le gestionnaire assure la gestion quotidienne ;
un ou plusieurs caissiers encaissent les paiements.

Si nous donnions directement tout le contrôle au gestionnaire, le propriétaire devenait dépendant de celui-ci pour l'ensemble de la gestion informatique.

Nous avons donc entièrement repensé cette architecture.

Notre nouvelle philosophie

Sur SantéProx, la pharmacie appartient toujours à son propriétaire.

Le logiciel doit refléter cette réalité.

Le propriétaire reste le responsable de son établissement.

Le gestionnaire est responsable des opérations quotidiennes.

Le caissier est responsable des encaissements.

Chaque utilisateur possède donc un rôle parfaitement défini.

Étape 1 : création de la structure par SantéProx

Lorsqu'une pharmacie souhaite rejoindre la plateforme, l'administrateur SantéProx crée uniquement la structure.

Il ne crée plus le gestionnaire.

Il crée uniquement la pharmacie.

Le formulaire est volontairement simple.

Exemple :

Nouvelle structure

Type :

○ Pharmacie

○ Hôpital

Email du propriétaire

À ce stade :

aucun gestionnaire n'existe ;
aucun caissier n'existe.

Seule la structure est enregistrée.

Étape 2 : invitation du propriétaire

Une fois la structure créée, SantéProx envoie automatiquement une invitation au propriétaire.

Exemple :

Bonjour,

Votre pharmacie a été enregistrée sur SantéProx.

Cliquez sur le lien ci-dessous afin d'activer votre espace.

[Activer mon compte]

Le propriétaire crée alors son mot de passe.

Son compte est immédiatement associé à sa pharmacie.

Aucune configuration technique n'est nécessaire.

Étape 3 : première connexion du propriétaire

Lors de sa première connexion, le propriétaire termine simplement la configuration de son établissement.

Il complète les informations manquantes :

adresse ;
coordonnées GPS ;
horaires ;
logo ;
informations complémentaires.

La pharmacie devient alors opérationnelle.

Étape 4 : le propriétaire constitue son équipe

C'est ici que notre fonctionnement devient très différent des autres logiciels.

Le propriétaire est le seul à pouvoir créer les utilisateurs internes de sa pharmacie.

Dans son tableau de bord, il dispose d'un espace :

Mon équipe

Depuis cet espace, il peut ajouter un collaborateur.

Le système lui demande uniquement :

Prénom

Téléphone

Adresse email

Rôle

Puis il choisit :

○ Gestionnaire

○ Caissier

Aucun autre rôle n'est proposé.

Étape 5 : invitation automatique

Une invitation est envoyée.

Le collaborateur reçoit un lien sécurisé.

Lors de sa première connexion, aucune configuration n'est nécessaire.

Le système connaît déjà :

son rôle ;
sa pharmacie ;
ses autorisations.

L'utilisateur n'a qu'à définir son mot de passe.

Les trois rôles de la pharmacie
1. Le propriétaire

Le propriétaire est le responsable de la pharmacie.

Il ne réalise pas les opérations quotidiennes.

Il supervise.

Il peut notamment consulter :

le chiffre d'affaires ;
les ventes ;
les bénéfices ;
les commandes ;
les stocks ;
les ruptures ;
les produits expirés ;
les statistiques ;
les performances des employés ;
les historiques,
le nombre de clien par jour grace au facture.

En revanche, il ne peut pas modifier les données opérationnelles.

Il ne peut pas :

modifier une vente ;
modifier le stock ;
modifier un prix ;
supprimer une facture.

Cette séparation garantit que toutes les opérations restent traçables.

2. Le gestionnaire

Le gestionnaire est l'utilisateur principal du logiciel.

Il travaille quotidiennement dans la pharmacie.

Il gère notamment :

les médicaments ;
les stocks ;
les approvisionnements ;
les fournisseurs ;
les ventes ;
les commandes ;
les dates d'expiration ;
inventaire;
les alertes de rupture.

Toutes ses actions sont enregistrées.

Le propriétaire peut les consulter.

3. Le caissier

Le caissier dispose d'une interface volontairement très simple.

Il ne gère jamais les médicaments.

Il ne touche jamais au stock.

Il intervient uniquement lors du paiement.

Son interface lui permet de :

retrouver une vente préparée par le gestionnaire ;
visualiser le montant à payer ;
choisir le mode de paiement ;
valider l'encaissement ;
imprimer ou réimprimer un ticket si nécessaire.

Chaque paiement est enregistré avec :

l'identité du caissier ;
la date ;
l'heure ;
le mode de paiement.

Ainsi, chaque encaissement est parfaitement traçable.

Une architecture conçue pour empêcher les erreurs et limiter les fraudes

Nous avons volontairement séparé les responsabilités.

Le gestionnaire prépare les ventes.

Le caissier encaisse les paiements.

Le propriétaire contrôle l'ensemble de l'activité.

Aucun utilisateur ne possède tous les pouvoirs.

Cette organisation réduit considérablement les risques :

modification non autorisée d'une vente ;
suppression discrète d'un encaissement ;
manipulation du stock sans historique ;
absence de traçabilité.

Chaque action est associée à un utilisateur identifié.

Une structure évolutive

Derrière cette organisation, SantéProx associe tous les utilisateurs à une même structure.

Nous utilisons une entité dédiée, EquipeStructure, qui relie chaque utilisateur à sa pharmacie et à son rôle.

Cette architecture permet aujourd'hui de gérer simplement une pharmacie, mais elle est également prête pour des évolutions futures, comme la gestion de plusieurs établissements par un même propriétaire ou l'administration d'une chaîne de pharmacies, sans devoir repenser le système.

Résultat

Avec cette organisation :

le propriétaire conserve toujours la maîtrise de son établissement ;
le gestionnaire travaille efficacement sans empiéter sur le rôle du propriétaire ;
le caissier se concentre uniquement sur les encaissements ;
toutes les opérations sont enregistrées et attribuées à un utilisateur précis ;
la plateforme reste simple à utiliser tout en offrant un niveau élevé de contrôle et de traçabilité.

C'est cette séparation claire des responsabilités qui fait de SantéProx non seulement un outil de référencement médical, mais également une solution de gestion fiable, adaptée au fonctionnement réel d'une pharmacie moderne.