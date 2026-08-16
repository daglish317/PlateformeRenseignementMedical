Spécification fonctionnelle — Architecture des dashboards pharmacie
1. Périmètre

Cette spécification concerne uniquement les dashboards liés à la gestion d'une pharmacie.

Elle concerne :

le dashboard du propriétaire de pharmacie ;
le dashboard du gestionnaire de pharmacie ;
le dashboard du caissier.

Elle ne concerne absolument pas :

le dashboard gestionnaire hospitalier ;
les fonctionnalités propres aux structures hospitalières.

Règle impérative : aucune modification ne doit être apportée au dashboard gestionnaire hospitalier et a au dashboard admin à cause de cette spécification.

2. Principe général

Nous ne voulons plus considérer le dashboard du gestionnaire et celui du caissier comme deux interfaces contenant un ensemble fixe de modules déterminé uniquement par leur rôle.

Le principe devient :

Le propriétaire de pharmacie dispose d'un panneau d'administration lui permettant de déterminer précisément quels modules chaque membre de son équipe peut utiliser.

Les membres concernés sont :

Propriétaire
    │
    ├── Gestionnaire pharmacie
    │
    └── Caissier

Chaque membre possède son propre compte et accède au dashboard pharmacie commun, mais le contenu fonctionnel visible dépend des autorisations accordées par le propriétaire.

3. Dashboard du gestionnaire et du caissier

Le gestionnaire et le caissier sont redirigés vers le dashboard pharmacie équipe après leur authentification.

Il ne faut donc pas créer une architecture totalement différente pour chaque rôle.

Le dashboard constitue une base commune :

Dashboard pharmacie équipe
│
├── Sidebar dynamique
│
├── Contenu du module sélectionné
│
├── Paramètres
│
└── Profil

Les modules visibles dans la sidebar dépendent des autorisations attribuées à l'utilisateur.

4. Modules obligatoires du dashboard équipe

Deux éléments sont prévus indépendamment des modules métier :

Profil

Le membre peut accéder à son profil conformément aux fonctionnalités déjà définies.

Paramètres

Le membre peut accéder aux paramètres prévus pour son compte.

Ces deux éléments ne doivent pas être traités comme des modules métier que le propriétaire active ou désactive.

Ils font partie de la structure de base du dashboard équipe.

5. Sidebar du propriétaire de pharmacie

Le propriétaire de pharmacie possède son propre dashboard.

Sa sidebar doit contenir l'ensemble des modules concernant la gestion de la pharmacie.

Le propriétaire ne doit donc pas avoir une sidebar limitée aux modules qu'il a personnellement activés.

Il doit pouvoir accéder à l'ensemble de son système de gestion.

La sidebar doit notamment contenir les modules que nous avons déjà définis :

Vente ;
Caisse ;
Stock ;
Approvisionnement ;
Inventaire ;
Historique ;
Alertes ;
Péremption ;
Statistiques ;
Tableau de bord ;
Gestion de l'équipe / utilisateurs ;
Paramètres ;
Profil ;
Messagerie ;
ainsi que tout autre module pharmacie déjà validé dans notre spécification.

La liste finale devra reprendre exactement les modules déjà validés dans le projet.

Aucun module pharmacie existant ne doit être oublié simplement parce qu'il n'a pas été utilisé récemment.

6. Cas particulier du module Messagerie

Le module Messagerie est une exception.

Il appartient exclusivement au propriétaire de pharmacie.

Il doit :

apparaître dans la sidebar du propriétaire ;
être accessible au propriétaire ;
ne jamais être proposé comme permission à attribuer ;
ne jamais apparaître dans la liste des modules activables/désactivables pour un gestionnaire ;
ne jamais apparaître dans la liste des modules activables/désactivables pour un caissier ;
ne jamais apparaître dans leur sidebar.

Donc :

Propriétaire
    │
    └── Messagerie ✅


Gestionnaire
    │
    └── Messagerie ❌


Caissier
    │
    └── Messagerie ❌

Il ne s'agit pas d'une permission désactivée.

Il s'agit d'un module exclusivement propriétaire.

7. Gestion des modules par le propriétaire

Depuis son dashboard, le propriétaire doit pouvoir sélectionner :

la structure concernée ;
le membre de l'équipe concerné ;
les modules auxquels ce membre doit avoir accès.

Exemple :

Structure :
Pharmacie Centrale


Membre :
Jean — Gestionnaire


Modules
☑ Stock
☑ Approvisionnement
☑ Vente
☐ Caisse
☑ Inventaire
☐ Statistiques
☐ Messagerie

Ici :

Messagerie

ne devrait même pas être présent dans cette interface.

8. Activation d'un module

Lorsque le propriétaire active un module :

Propriétaire
    ↓
Active Stock pour Jean
    ↓
Autorisation enregistrée
    ↓
Stock apparaît dans sa sidebar

Le module devient alors réellement accessible.

Il ne suffit pas de l'afficher graphiquement.

Le backend doit également vérifier l'autorisation.

9. Désactivation d'un module

Le propriétaire peut également retirer une autorisation.

Exemple :

Avant :


Jean
├── Stock
├── Vente
├── Approvisionnement
└── Inventaire

Le propriétaire désactive :

Approvisionnement

Après :

Jean
├── Stock
├── Vente
└── Inventaire

L'accès fonctionnel doit également être retiré côté backend.

10. La sidebar n'est pas la source d'autorisation

C'est une règle technique importante.

Il ne faut jamais faire :

Module affiché dans sidebar
        ↓
Utilisateur autorisé

La logique correcte est :

Autorisation backend
        ↓
Frontend récupère les permissions
        ↓
Sidebar construite dynamiquement
        ↓
Modules autorisés affichés

Et lorsqu'un utilisateur tente malgré tout d'accéder directement à une URL :

URL module
    ↓
Backend vérifie permission
    ↓
Autorisé → accès
Non autorisé → refus

Cela évite qu'un utilisateur contourne simplement la sidebar en saisissant directement l'URL.

11. Les modules doivent être indépendants des rôles

Il ne faut pas coder une logique rigide du type :

if role === "gestionnaire":
    afficher Stock


if role === "caissier":
    afficher Caisse

Cette logique ne correspond plus à notre conception.

Le rôle identifie la catégorie de l'utilisateur :

GESTIONNAIRE
CAISSIER

Mais l'autorisation détermine ses capacités.

Conceptuellement :

Utilisateur
│
├── rôle
│
└── permissions
      │
      ├── Stock
      ├── Vente
      ├── Caisse
      ├── Approvisionnement
      └── ...
12. Permissions au niveau du module

L'accès à un module ne signifie pas nécessairement que l'utilisateur peut tout y faire.

C'est justement un point que nous avions déjà validé.

Pour chaque module, le propriétaire doit pouvoir déterminer les actions autorisées lorsqu'elles existent.

Exemple :

Stock
├── Consulter
├── Modifier
├── Supprimer
└── Filtrer

ou :

Approvisionnement
├── Consulter
├── Ajouter
├── Modifier
├── Imprimer
└── Exporter

La liste exacte des actions dépendra du module concerné.

Il ne faut pas inventer des actions génériques qui n'existent pas dans la spécification fonctionnelle du module.

13. Exemple concret

Le propriétaire crée son équipe :

Structure : Pharmacie Centrale


Équipe :


Jean
Rôle : Gestionnaire


Paul
Rôle : Caissier

Il configure Jean :

Stock              ☑
Approvisionnement   ☑
Vente               ☑
Caisse              ☐
Inventaire          ☑
Historique          ☑
Alertes             ☐
Péremption          ☐
Statistiques        ☐

Jean verra uniquement les modules autorisés.

Puis le propriétaire configure Paul :

Stock              ☐
Approvisionnement   ☐
Vente               ☑
Caisse              ☑
Inventaire          ☐
Historique          ☑
Alertes             ☐
Péremption          ☐
Statistiques        ☐

Paul aura alors une sidebar différente de Jean, même s'ils utilisent le même dashboard pharmacie équipe.

14. Modification en temps réel de l'accès

Le propriétaire doit pouvoir modifier les autorisations à tout moment.

Exemple :

Paul n'a pas accès à Stock
        ↓
Propriétaire active Stock
        ↓
Paul obtient Stock

Inversement :

Paul possède Stock
        ↓
Propriétaire désactive Stock
        ↓
Paul perd l'accès

Le comportement exact lorsque Paul est actuellement connecté devra être défini lors de l'implémentation :

actualisation des permissions ;
invalidation de session ;
mise à jour dynamique de la sidebar ;
contrôle backend lors de chaque accès.

Mais dans tous les cas, la suppression d'une permission doit prendre effet réellement et pas uniquement visuellement.

15. Gestion de plusieurs structures

Le propriétaire peut gérer plusieurs structures.

Son dashboard doit donc permettre de sélectionner la structure concernée avant de gérer son équipe et ses permissions.

Conceptuellement :

Propriétaire
│
├── Structure A
│   ├── Gestionnaire
│   └── Caissier
│
├── Structure B
│   ├── Gestionnaire
│   └── Caissier
│
└── Structure C
    ├── Gestionnaire
    └── Caissier

Une autorisation accordée dans une structure ne doit pas automatiquement donner la même autorisation dans une autre structure.

La permission doit être liée au contexte de la structure concernée.

16. Séparation stricte des dashboards

Nous devons figer cette règle pour éviter une nouvelle erreur d'implémentation.

Dashboard propriétaire pharmacie

Concerné par cette spécification.

Il contient :

tous les modules pharmacie ;
gestion de l'équipe ;
gestion des permissions ;
messagerie propriétaire ;
etc.
Dashboard gestionnaire pharmacie

Concerné par cette spécification.

Il utilise le dashboard équipe dynamique.

Dashboard caissier

Concerné par cette spécification.

Il utilise le même dashboard équipe dynamique.

Dashboard propriétaire hôpital

Hors périmètre.

Aucune modification.

Dashboard gestionnaire hôpital

Hors périmètre.

Aucune modification.

17. Règle impérative pour l'implémentation

L'IA développeuse devra respecter la règle suivante :

Ne modifier que les fichiers et composants nécessaires à cette évolution. Ne pas refactoriser ou réécrire des parties fonctionnelles existantes qui ne sont pas concernées. Ne pas modifier le dashboard propriétaire hospitalier ni le dashboard gestionnaire hospitalier. Ne pas supprimer les modules existants. Ne pas créer de nouvelles fonctionnalités non spécifiées.

Et surtout :

Avant toute modification, identifier précisément les composants, routes, services, types et mécanismes de permissions actuellement utilisés afin de réutiliser l'existant lorsque cela est possible.

18. Base architecturale que nous allons utiliser

La logique finale est donc :

                    PROPRIÉTAIRE PHARMACIE
                             │
                 ┌───────────┴───────────┐
                 │                       │
          Tous les modules          Gestion équipe
          pharmacie accessibles            │
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                        Gestionnaire            Caissier
                              │                     │
                              └──────────┬──────────┘
                                         │
                                  Dashboard équipe
                                         │
                              Permissions attribuées
                                         │
                       ┌─────────────────┼─────────────────┐
                       ▼                 ▼                 ▼
                    Sidebar          Modules           Actions
                   dynamique        autorisés        autorisées