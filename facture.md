Spécification fonctionnelle — Module Facture
1. Objectif

Le module Facture permet de produire, consulter, rechercher et imprimer une facture correspondant à un achat effectué par un client de la pharmacie.

La facture est construite à partir d'une vente existante et finalisée.

Le module Facture ne constitue pas un deuxième module de vente.

2. Principe fondamental

Une facture est toujours rattachée à une vente.

Vente
   ↓
Validation par la caisse
   ↓
Paiement validé
   ↓
Vente finalisée
   ↓
Facture

Le système ne doit pas demander au gestionnaire ou au caissier de ressaisir les produits, les quantités ou les prix.

Ces informations sont récupérées automatiquement depuis la vente.

3. Conditions pour générer une facture

Une facture peut être générée à partir d'une vente finalisée.

Le système doit vérifier que la vente est dans un état permettant la génération d'une facture.

Une vente annulée ou non finalisée ne doit pas produire une facture définitive.

4. Création de la facture

L'utilisateur disposant de l'autorisation nécessaire sélectionne une vente puis choisit :

Générer une facture

Le système récupère automatiquement :

la référence de la vente ;
la date de la vente ;
les produits ;
les quantités ;
les prix unitaires ;
les montants des lignes ;
le montant total ;
le bénéficiaire s'il existe déjà.
5. Gestion du bénéficiaire

C'est le point que nous venons de modifier.

Le bénéficiaire peut être renseigné à trois moments.

Cas 1 — Bénéficiaire renseigné pendant la vente
Vente
   ↓
Bénéficiaire renseigné
   ↓
Caisse
   ↓
Paiement
   ↓
Facture

Le nom est automatiquement récupéré dans la facture.

Aucune nouvelle saisie n'est demandée.

Cas 2 — Bénéficiaire renseigné à la caisse

Si le gestionnaire n'a pas renseigné le bénéficiaire pendant la vente, le caissier peut le faire au moment de l'encaissement.

Le nom est alors conservé avec les données de la transaction.

Lors de la génération de la facture, le système le récupère automatiquement.

Cas 3 — Aucun bénéficiaire renseigné

Si aucun bénéficiaire n'a été renseigné pendant :

la vente ;
la caisse ;

alors, au moment où l'utilisateur demande la génération de la facture, le système doit détecter l'absence du bénéficiaire.

Il affiche alors un champ :

Nom du bénéficiaire

Ce champ devient obligatoire pour cette génération de facture.

Exemple :

Génération de la facture


Bénéficiaire *
[________________________________]


[Annuler]     [Générer la facture]

L'utilisateur ne peut pas générer la facture tant que le nom n'est pas renseigné.

6. Conservation du bénéficiaire

Le nom saisi lors de la génération doit être enregistré avec la facture.

Il ne doit pas uniquement être injecté dans le document PDF.

Ainsi :

Vente
   │
   ├── Produits
   ├── Paiement
   └── ...
   
Facture
   │
   ├── Numéro
   ├── Vente associée
   ├── Date
   ├── Produits
   ├── Total
   └── Bénéficiaire

Cette conservation est nécessaire notamment pour permettre la recherche ultérieure par nom.

7. Numéro de facture

Chaque facture possède une référence unique générée par le système.

Exemple :

F-000001
F-000002
F-000003

La référence de facture est différente de la référence de vente.

Vente : V-000145
Facture : F-000098
8. Éviter les doublons

Une vente déjà associée à une facture ne doit pas générer une nouvelle facture identique à chaque clic.

Si l'utilisateur sélectionne une vente qui possède déjà une facture :

Facture existante

Le système doit proposer de :

consulter la facture ;
imprimer la facture.

Il ne doit pas créer inutilement une deuxième facture.

9. Contenu de la facture

La facture doit afficher au minimum :

Informations de la pharmacie
nom de la structure ;
informations d'identification disponibles dans le système.
Informations de la facture
numéro de facture ;
date ;
référence de la vente.
Bénéficiaire
nom du bénéficiaire.

Le bénéficiaire est désormais obligatoire pour une facture générée, soit parce qu'il existait déjà, soit parce qu'il a été demandé au moment de la génération.

Détail des produits

Pour chaque produit :

nom ;
quantité ;
prix unitaire ;
montant de la ligne.
Total
montant total de la facture.

Les montants doivent provenir de la vente et ne doivent pas être recalculés arbitrairement par le frontend.

10. Recherche des factures

Le module doit permettre de retrouver rapidement une facture existante.

La recherche doit notamment permettre de rechercher par :

numéro de facture ;
référence de vente ;
nom du bénéficiaire.
11. Filtre par date

Le module doit permettre de filtrer les factures par date.

L'utilisateur doit pouvoir sélectionner une période.

Exemple :

Date de début : 01/08/2026
Date de fin   : 15/08/2026

Le système retourne uniquement les factures correspondant à cette période.

12. Filtre par nom du bénéficiaire

Le module doit également permettre de rechercher les factures selon le nom du bénéficiaire.

Exemple :

Bénéficiaire
[ Jean Dupont ]

Le système retourne les factures correspondant au nom recherché.

La recherche doit être suffisamment souple pour permettre de retrouver les factures enregistrées avec ce bénéficiaire.

13. Combinaison des filtres

Les filtres doivent pouvoir être combinés.

Par exemple :

Bénéficiaire : Jean Dupont
Date début   : 01/08/2026
Date fin     : 15/08/2026

Le système retourne les factures de Jean Dupont réalisées pendant cette période.

Cela est particulièrement utile lorsque la pharmacie possède un grand nombre de factures.

14. Consultation

Une facture sélectionnée doit pouvoir être consultée directement dans le module.

L'utilisateur doit pouvoir voir :

numéro ;
date ;
bénéficiaire ;
vente associée ;
produits ;
quantités ;
prix ;
total.
15. Impression

Le système doit permettre d'imprimer la facture.

L'impression doit utiliser les données enregistrées de la facture.

Si le bénéficiaire a été demandé au moment de la génération, le nom doit donc apparaître normalement sur le document.

16. Génération PDF

La facture doit pouvoir être générée sous forme de document PDF adapté à l'impression.

Le PDF doit représenter fidèlement la facture enregistrée.

Il ne doit pas être différent des données affichées dans le module.

17. Relation avec le stock

Le module Facture ne modifie jamais directement le stock.

La modification du stock appartient au workflow de vente/caisse.

Vente + Caisse
       ↓
Modification du stock

et :

Facture
       ↓
Document correspondant à la vente

La création d'une facture ne doit donc jamais provoquer une nouvelle diminution de stock.

18. Relation avec le reçu

Il faut maintenir une distinction claire entre les deux.

Reçu

Le reçu correspond au paiement.

Il est produit par le workflow de caisse.

Facture

La facture correspond à l'achat/la vente finalisée et constitue le document de facturation.

Ils peuvent concerner la même transaction, mais ils restent deux documents différents.

19. Retour en caisse et facture

Nous avons déjà défini :

Reçu non imprimé
Vente validée
      ↓
Problème
      ↓
Annulation
Reçu déjà imprimé
Vente validée
      ↓
Reçu imprimé
      ↓
Problème
      ↓
Retour en caisse

La facture doit respecter l'état final de la transaction.

Une opération qui a été correctement annulée/retournée ne doit pas continuer à être présentée comme une vente définitive dans le module Facture.

20. Accès au module

Le module Facture fait partie des modules de la pharmacie.

Le propriétaire de pharmacie y a accès.

Pour le gestionnaire et le caissier, l'accès dépend du système de permissions défini par le propriétaire.

Propriétaire
      │
      ├── Autorise Facture → Gestionnaire
      │
      └── Autorise Facture → Caissier

Si l'autorisation n'est pas accordée :

Facture n'apparaît pas dans la sidebar ;
l'accès direct à la route doit également être refusé côté backend.
21. Plusieurs structures

Si un propriétaire gère plusieurs pharmacies, les factures doivent rester rattachées à leur structure.

Propriétaire
│
├── Pharmacie A
│   ├── Vente
│   └── Factures
│
└── Pharmacie B
    ├── Vente
    └── Factures

Une facture de la Pharmacie A ne doit jamais être visible dans le contexte de la Pharmacie B.

22. Workflow complet définitif
                    VENTE
                      │
                      ▼
             Produits sélectionnés
                      │
                      ▼
        Bénéficiaire renseigné ?
             │              │
            Oui            Non
             │              │
             │              ▼
             │            CAISSE
             │              │
             │      Bénéficiaire renseigné ?
             │          │          │
             │         Oui        Non
             │          │          │
             └──────────┴──────────┘
                        │
                        ▼
                  Paiement validé
                        │
                        ▼
                  Vente finalisée
                        │
                        ▼
                Génération facture
                        │
              ┌─────────┴─────────┐
              │                   │
       Bénéficiaire existe    Aucun bénéficiaire
              │                   │
              │                   ▼
              │             Champ obligatoire
              │             "Nom bénéficiaire"
              │                   │
              └─────────┬─────────┘
                        ▼
                Enregistrement
                de la facture
                        │
                        ▼
               Facture disponible
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
          Consulter  Imprimer   Rechercher
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                    Par date        Par bénéficiaire
Règle finale à donner à l'IA

Si aucun bénéficiaire n'a été renseigné pendant la vente ou la caisse, la génération de facture doit obligatoirement demander le nom du bénéficiaire avant de créer la facture. Le nom saisi doit être enregistré de manière persistante avec la facture et apparaître sur le document généré. Le module Facture doit également proposer une recherche par nom du bénéficiaire et un filtrage par date, avec possibilité de combiner ces filtres.