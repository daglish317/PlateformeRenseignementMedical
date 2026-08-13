Spécification fonctionnelle — Gestion hiérarchique des équipes et permissions
1. Principe général

Le système ne doit plus attribuer automatiquement un ensemble fixe de fonctionnalités au Gestionnaire ou au Caissier uniquement en fonction de leur rôle.

Le rôle reste une identité fonctionnelle de base, mais l'accès réel à la plateforme est déterminé par les autorisations configurées par le Propriétaire.

Le Propriétaire est donc le seul utilisateur capable de définir :

qui appartient à une équipe ;
dans quelle structure cette personne intervient ;
quels modules elle peut consulter ;
quelles actions elle peut effectuer dans chaque module ;
quelles permissions elle peut perdre ou récupérer ultérieurement.

Le système doit permettre au Propriétaire de modifier ces autorisations à tout moment.

2. Les rôles restent distincts

Les rôles actuellement définis restent :

PROPRIETAIRE

Il possède le niveau de contrôle supérieur.

Il peut :

gérer ses structures ;
gérer les équipes ;
attribuer les modules ;
attribuer les permissions détaillées ;
retirer les permissions ;
consulter les informations administratives correspondant à ses structures ;
utiliser le module Messagerie.
GESTIONNAIRE

Le Gestionnaire est un membre opérationnel de l'équipe.

Il ne reçoit plus automatiquement tous les modules du dashboard Gestionnaire.

Son accès dépend des autorisations accordées par le Propriétaire.

CAISSIER

Le Caissier est également un membre opérationnel.

Il ne reçoit plus automatiquement un ensemble fixe de fonctionnalités liées à la caisse.

Son accès dépend des autorisations accordées par le Propriétaire.

3. Un seul modèle de dashboard opérationnel

Il ne faut plus concevoir le système comme :

Dashboard Gestionnaire
    ├── Approvisionnement
    ├── Stock
    ├── Vente
    └── ...

Dashboard Caissier
    ├── Caisse
    └── ...

Le modèle devient :

              DASHBOARD OPÉRATIONNEL
                       │
          ┌────────────┴────────────┐
          │                         │
      Gestionnaire               Caissier
          │                         │
          └────────────┬────────────┘
                       │
              Permissions accordées
                 par le propriétaire

Tous les utilisateurs opérationnels utilisent donc le même système de dashboard.

Ce qui change d'un utilisateur à l'autre est :

la présence des modules dans la sidebar ;
les actions disponibles ;
les données accessibles ;
les opérations autorisées.
4. Le rôle ne donne pas directement accès à un module

Exemple :

Le propriétaire ajoute :

Jean — Gestionnaire

Cela ne signifie pas automatiquement :

Jean
├── Stock
├── Approvisionnement
├── Vente
├── Caisse
├── Inventaire
├── Alertes
└── ...

Le système doit initialement lui appliquer uniquement les autorisations correspondant à la configuration définie par le propriétaire.

Si le Propriétaire active uniquement :

Approvisionnement
Stock

alors Jean ne doit voir que :

Sidebar
├── Approvisionnement
└── Stock

Les autres modules ne doivent pas simplement être désactivés visuellement.

Ils doivent être réellement interdits d'accès.

Ainsi, un utilisateur ne doit pas pouvoir accéder à un module en tapant directement son URL.

5. Activation d'un module

Depuis son panneau d'administration, le Propriétaire doit pouvoir sélectionner :

la structure concernée ;
le membre concerné ;
le module concerné ;
les permissions accordées dans ce module.

Exemple :

Structure : Pharmacie X
Membre : Jean
Rôle : Gestionnaire

Modules

☑ Approvisionnement
☑ Stock
☐ Vente
☐ Caisse
☑ Inventaire
☐ Alertes

Si le propriétaire active Vente, le module apparaît dans le dashboard de Jean.

S'il désactive ensuite Vente, le module disparaît de son interface et son accès doit également être bloqué côté autorisation.

6. Les permissions ne s'arrêtent pas au module

C'est un point essentiel.

L'autorisation :

« Jean peut accéder au module Stock »

ne signifie pas :

« Jean peut tout faire dans Stock ».

Chaque module doit donc posséder ses propres permissions.

Exemple :

Stock
    ├── Consulter
    ├── Filtrer
    ├── Rechercher
    ├── Modifier
    ├── Supprimer
    ├── Exporter
    └── Imprimer

Le Propriétaire peut sélectionner précisément les actions autorisées.

7. Exemple concret : Gestionnaire

Le Propriétaire peut configurer :

Jean — Gestionnaire

APPROVISIONNEMENT
☑ Consulter
☑ Créer
☑ Modifier
☐ Supprimer
☑ Imprimer
☑ Exporter

STOCK
☑ Consulter
☑ Filtrer
☑ Rechercher
☐ Modifier
☐ Supprimer
☑ Imprimer
☑ Exporter

VENTE
☑ Consulter
☑ Créer
☐ Modifier
☐ Annuler

Jean aura alors exactement ces capacités.

Il ne doit pas recevoir automatiquement les autres actions.

8. Exemple concret : Caissier

Le propriétaire peut configurer :

Paul — Caissier

CAISSE
☑ Consulter
☑ Valider paiement
☑ Refuser paiement
☑ Imprimer reçu
☑ Retour en caisse
☐ Supprimer

VENTE
☑ Consulter
☐ Créer
☐ Modifier
☐ Annuler

APPROVISIONNEMENT
☑ Consulter
☐ Créer
☐ Modifier
☐ Supprimer

Cela signifie qu'un Caissier peut exceptionnellement avoir accès à Approvisionnement si le Propriétaire le décide.

Le rôle « Caissier » ne doit donc pas empêcher une autorisation supplémentaire.

9. Une permission peut être retirée à tout moment

Le Propriétaire doit pouvoir revenir dans la configuration d'un membre.

Exemple :

Aujourd'hui :

Jean
Approvisionnement = ACTIVÉ
Stock = ACTIVÉ
Vente = ACTIVÉ

Le propriétaire désactive Vente.

Le résultat doit être immédiat ou prendre effet selon le mécanisme de synchronisation prévu par l'application :

Jean
Approvisionnement = ACTIVÉ
Stock = ACTIVÉ
Vente = DÉSACTIVÉ

Jean :

ne voit plus Vente dans sa sidebar ;
ne peut plus accéder à la page Vente ;
ne peut plus appeler directement les opérations protégées de Vente.
10. Le propriétaire peut également modifier les actions

Exemple :

Jean possède :

Stock
├── Consulter ✓
├── Filtrer ✓
├── Modifier ✓
└── Supprimer ✓

Le propriétaire décide ensuite :

Supprimer ✗

Jean conserve :

Stock
├── Consulter ✓
├── Filtrer ✓
└── Modifier ✓

L'interface doit automatiquement adapter les actions disponibles.

Par exemple, si Jean n'a pas la permission supprimer, le bouton Supprimer ne doit pas apparaître.

Mais encore une fois :

cacher le bouton n'est pas une mesure de sécurité.

L'opération doit également être interdite au niveau de l'autorisation réelle.

11. Les permissions doivent être propres à chaque structure

C'est indispensable puisque tu as précisé que le Propriétaire peut gérer plusieurs structures.

Exemple :

Propriétaire
│
├── Pharmacie A
│     ├── Jean — Gestionnaire
│     └── Paul — Caissier
│
└── Pharmacie B
      ├── Marie — Gestionnaire
      └── Pierre — Caissier

Jean peut avoir :

Pharmacie A
Stock = Oui
Vente = Oui

mais cela ne signifie pas automatiquement qu'il possède les mêmes droits dans :

Pharmacie B

Le système doit donc toujours savoir :

Utilisateur
    +
Structure
    +
Module
    +
Permission

avant d'autoriser une opération.

12. Sélection de la structure par le Propriétaire

Le dashboard propriétaire doit être conçu comme un véritable panneau d'administration multi-structure.

Le Propriétaire doit pouvoir sélectionner la structure qu'il souhaite administrer.

Exemple :

Structure sélectionnée :
[ Pharmacie Centrale ▼ ]

Une fois la structure sélectionnée, le système affiche :

Équipe
├── Jean — Gestionnaire
├── Paul — Caissier
└── Marie — Gestionnaire

Le Propriétaire peut alors sélectionner une personne et gérer ses autorisations.

13. Gestion centralisée d'une équipe

Le Propriétaire doit disposer d'une vue permettant de comprendre rapidement :

STRUCTURE
     ↓
MEMBRE
     ↓
RÔLE
     ↓
MODULES
     ↓
PERMISSIONS

Exemple :

Pharmacie Centrale

Jean
Gestionnaire

✓ Approvisionnement
   ✓ Consulter
   ✓ Créer
   ✓ Modifier
   ✗ Supprimer

✓ Stock
   ✓ Consulter
   ✓ Filtrer
   ✗ Modifier
   ✗ Supprimer

✗ Vente

✗ Caisse

Cette représentation doit être lisible et permettre au Propriétaire de modifier les droits sans devoir parcourir plusieurs écrans inutiles.

14. Sidebar dynamique

La sidebar du dashboard opérationnel doit être générée à partir des permissions réellement accordées.

Exemple :

Permissions de Jean :

Approvisionnement = true
Stock = true
Vente = false
Caisse = false
Inventaire = true

Sa sidebar devient :

Dashboard
Approvisionnement
Stock
Inventaire

Si le propriétaire active Vente :

Dashboard
Approvisionnement
Stock
Vente
Inventaire

La sidebar ne doit donc jamais être codée comme une liste fixe dépendant uniquement du rôle.

15. Sécurité des routes

Cette règle doit absolument apparaître dans la spécification.
La présence ou l'absence d'un module dans la sidebar n'est jamais considérée comme un mécanisme de sécurité.

Toute page, route, action ou opération protégée doit vérifier les permissions réelles de l'utilisateur.

Un utilisateur qui ne possède pas la permission nécessaire doit être refusé même s'il tente :

- d'accéder directement à l'URL ;
- de recharger une ancienne URL ;
- d'utiliser un lien sauvegardé ;
- de déclencher directement une opération depuis le client.

La sécurité effective doit donc être contrôlée côté backend.

Le frontend sert ensuite à refléter ces permissions dans l'interface.

16. Module Messagerie : exception absolue

Tu as fixé une règle particulière :

Le module Messagerie appartient exclusivement au Propriétaire.

Il ne doit donc jamais être attribuable au Gestionnaire ou au Caissier.

Même si le Propriétaire configure les permissions d'un membre, Messagerie ne doit pas apparaître comme un module attribuable.

Ainsi :

PROPRIETAIRE
├── Dashboard
├── Structures
├── Equipes
├── Permissions
├── Statistiques
├── Alertes
├── Messagerie
└── ...

GESTIONNAIRE
└── Modules autorisés

CAISSIER
└── Modules autorisés

Le Gestionnaire et le Caissier ne doivent jamais avoir accès à Messagerie.

17. Important : ne pas confondre rôle et permission

Le modèle final doit être pensé ainsi :

RÔLE
   ↓
identifie la fonction principale de l'utilisateur

PERMISSIONS
   ↓
déterminent ce qu'il peut réellement faire

STRUCTURE
   ↓
détermine où ces permissions s'appliquent

Donc :

Gestionnaire ≠ accès automatique à Approvisionnement

et :

Caissier ≠ accès automatique uniquement à Caisse

Le Propriétaire décide.

18. Création d'une équipe — nouveau workflow

Le workflow devient donc :

PROPRIETAIRE
      │
      ▼
Sélectionne la structure
      │
      ▼
Créer un membre
      │
      ├── Nom
      ├── Email
      └── Rôle
             │
             ├── Gestionnaire
             └── Caissier
      │
      ▼
Création du membre
      │
      ▼
Configuration des modules
      │
      ▼
Configuration des permissions
      │
      ▼
Enregistrement
      │
      ▼
 activation du compte
      │
      ▼
Utilisateur se connecte
      │
      ▼
Le système récupère ses permissions
      │
      ▼
Dashboard opérationnel personnalisé
19. Ce que voit finalement chaque utilisateur

Le système ne doit plus avoir besoin de construire trois interfaces différentes.

Propriétaire
Dashboard propriétaire
├── Structures
├── Équipes
├── Permissions
├── Stocks / modules administrables
├── Statistiques
├── Alertes
├── Messagerie
└── ...
Gestionnaire
Dashboard opérationnel
├── Dashboard
├── [Modules autorisés]
└── [Actions autorisées]
Caissier
Dashboard opérationnel
├── Dashboard
├── [Modules autorisés]
└── [Actions autorisées]

Le contenu réel dépend de la configuration du Propriétaire.

20. Règle finale à intégrer à notre architecture

La nouvelle logique d'autorisation de SantéProx doit être :

                  PROPRIETAIRE
                       │
                       ▼
                  STRUCTURE
                       │
                       ▼
                    MEMBRE
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
         GESTIONNAIRE         CAISSIER
             │                   │
             └─────────┬─────────┘
                       ▼
                    MODULES
                       │
                       ▼
                  PERMISSIONS
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Consulter        Modifier         Supprimer
       │               │                │
       ▼               ▼                ▼
   Filtrer          Exporter         Imprimer
                       │
                       ▼
                ACTIONS MÉTIER

C'est cette architecture qui doit désormais remplacer notre ancienne logique de dashboards figés par rôle.

Et il y a une conséquence importante pour les spécifications que nous avons déjà écrites : les modules Approvisionnement, Stock, Vente, Caisse, Inventaire, Alertes, Péremption, Factures, etc. ne doivent plus dire simplement « le Gestionnaire peut faire X ». Ils doivent désormais être formulés comme « si le Propriétaire accorde la permission X au membre, celui-ci peut faire X », avec les exceptions métier obligatoires (notamment Messagerie, qui reste exclusivement propriétaire).