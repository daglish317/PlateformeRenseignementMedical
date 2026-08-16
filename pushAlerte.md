Spécification fonctionnelle — Notifications Push et alertes propriétaire
1. Objectif

Le système doit permettre au propriétaire de recevoir sur son téléphone les alertes importantes concernant ses pharmacies, même lorsqu'il n'est pas actuellement connecté au dashboard.

Le système distingue :

Alerte interne : visible dans le dashboard ;
Notification push : notification envoyée sur l'appareil du propriétaire.

Une alerte interne ne doit donc pas automatiquement devenir une notification push.

2. Destinataire

Les notifications push concernent uniquement :

Le propriétaire de la structure.

Les gestionnaires et caissiers ne reçoivent aucune notification push dans cette première version.

Le propriétaire peut gérer plusieurs structures. Une notification doit donc toujours permettre d'identifier la structure concernée.

Exemple :

⚠️ Stock faible — Pharmacie Centrale
8 produits sont actuellement sous le seuil de stock.

3. Événements déclenchant une notification push

Pour éviter la saturation, nous retenons uniquement les événements importants.

A. Stock faible

Une notification est générée lorsqu'un médicament atteint le seuil défini :

quantité < 10

Exemple :

⚠️ Stock faible
Paracétamol 500 mg — Pharmacie Centrale
Stock actuel : 7

Règle anti-répétition

Le système ne doit pas envoyer une notification à chaque consultation ou chaque opération concernant le produit.

Pour un même médicament, une nouvelle notification ne doit être générée que lorsque cela est nécessaire, notamment lorsque le stock revient au-dessus du seuil puis repasse en dessous.

4. Médicaments proches de la péremption

Le module Péremption détecte les produits dont la date d'expiration est dans 3 mois ou moins.

Le propriétaire peut recevoir une notification lorsqu'un produit entre dans cette période.

Exemple :

⚠️ Péremption proche
Paracétamol 500 mg
Expiration dans 2 mois — Pharmacie Centrale

L'objectif est d'attirer l'attention du propriétaire, pas d'envoyer une notification quotidiennement pour le même produit.

5. Suppression ou modification par le propriétaire

Lorsqu'une action sensible est effectuée par le propriétaire lui-même, elle doit être enregistrée dans la traçabilité.

Cependant, elle ne doit pas générer une notification push au propriétaire qui vient de réaliser l'action.

L'événement doit plutôt être :

enregistré dans l'historique/traçabilité ;
visible dans les alertes appropriées si nécessaire.

Il serait inutile de notifier quelqu'un de sa propre action.

6. Événements qui NE doivent PAS générer de push

Pour limiter fortement le bruit, aucune notification push ne doit être envoyée pour :

chaque vente ;
chaque approvisionnement ;
chaque encaissement ;
chaque annulation de vente ;
chaque impression de reçu ;
chaque inventaire ;
chaque recherche ;
chaque connexion d'un gestionnaire ;
chaque connexion d'un caissier ;
chaque modification normale de stock ;
chaque consultation d'un module.

Ces informations restent accessibles dans les modules concernés.

7. Regroupement des alertes

Il peut y avoir plusieurs problèmes simultanément.

Exemple :

Paracétamol → stock faible
Amoxicilline → stock faible
Ibuprofène → péremption proche

Le système ne doit pas nécessairement envoyer trois notifications immédiatement.

Il peut regrouper les alertes lorsque cela améliore l'expérience :

⚠️ 3 alertes nécessitent votre attention
2 stocks faibles
1 médicament proche de la péremption
Pharmacie Centrale

Le propriétaire peut ensuite ouvrir le dashboard pour consulter le détail.

8. Notification Push et cloche du dashboard

Les deux mécanismes doivent rester cohérents.

Push

Notification envoyée sur le téléphone.

Dashboard

L'alerte apparaît dans le système.

Exemple :

Téléphone
   ↓
🔔 1 nouvelle alerte
   ↓
Propriétaire ouvre le dashboard
   ↓
Sidebar → Alertes
   ↓
Alerte consultée
   ↓
Marqueur non lu supprimé

La notification push n'est donc pas la source de vérité.

La source de vérité reste le système backend.

9. Permissions de notification

Le système ne doit pas demander l'autorisation de notification immédiatement à l'ouverture du site.

Le propriétaire doit d'abord comprendre pourquoi les notifications sont utiles.

Le système peut afficher une demande lorsque le propriétaire active la fonctionnalité.

Exemple :

Activer les notifications ?
Recevez les alertes importantes concernant vos pharmacies : stocks faibles et médicaments proches de la péremption.

Puis :

[Activer les notifications]
[Plus tard]
10. Gestion de plusieurs appareils

Le propriétaire peut utiliser :

son téléphone ;
son ordinateur ;
une tablette.

Le système doit pouvoir enregistrer plusieurs abonnements push pour le même propriétaire.

Exemple :

Propriétaire
├── Téléphone Android
├── Ordinateur
└── Tablette

Une alerte importante peut donc être envoyée aux appareils ayant une subscription active.

11. Désactivation

Le propriétaire doit pouvoir désactiver les notifications push.

La désactivation des notifications push ne doit pas désactiver les alertes du dashboard.

Ainsi :

Push désactivé
       ↓
Dashboard continue de recevoir les alertes
12. Architecture fonctionnelle

Le workflow global sera :

              ÉVÉNEMENT MÉTIER
                     │
                     ▼
              Backend Django
                     │
                     ▼
             Création d'une alerte
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
        Dashboard        Critique ?
        propriétaire        │
                            ▼
                     Notification Push
                            │
                            ▼
                      Téléphone

Le backend reste donc responsable de la décision :

« Est-ce qu'une notification doit être envoyée ? »

Le frontend/PWA est responsable de :

« Comment recevoir et afficher cette notification ? »

13. Technologies nécessaires

Pour l'implémentation, nous aurons besoin de :

PWA
 │
 ├── Web App Manifest
 ├── Service Worker
 │
 └── Web Push
       │
       ├── Subscription
       ├── Endpoint
       ├── Clés de chiffrement
       └── VAPID

Et côté backend :

Django
 │
 ├── utilisateur propriétaire
 ├── subscriptions push
 ├── génération des alertes
 └── envoi des notifications

Le backend devra conserver les subscriptions nécessaires à l'envoi des notifications.