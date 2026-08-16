# Audit critique UI/UX - SanteProx

Date: 16 aout 2026

Perimetre analyse: frontend Next.js, pages publiques, authentification, dashboards admin/proprietaire/hopital/pharmacie, navigation, composants UI partages, assets logo/PWA, formulaires, tables, textes, responsive et experience percue.

## Verdict direct

Le projet a une base technique correcte: Next.js, composants partages, theming clair/sombre, dashboards separes, icones lucide, carte, recherche, tables metier, formulaires et modules admin. Mais l'experience visuelle actuelle ne donne pas encore le niveau de confiance attendu pour une plateforme de sante destinee a un usage massif.

Le probleme principal n'est pas l'absence de composants. Le probleme est la coherence produit. Les ecrans donnent parfois l'impression d'un assemblage de modules developpes au fil des besoins: couleurs variables, tailles trop petites, textes casses, libelles mal hierarchises, cartes partout, navigation dense, et parcours metier qui manquent de priorite visuelle.

Pour un produit qui vise des millions d'utilisateurs, il faut elever la barre: l'interface doit etre lisible en quelques secondes, stable, rassurante, rapide a scanner, et tres claire pour un patient, un caissier, un gestionnaire, un proprietaire ou un administrateur.

## Gravite maximale

### 1. Textes mal encodes visibles

On voit dans plusieurs fichiers des textes du type `DÃ©connexion`, `RÃ©sultats`, `QuantitÃ©`, `PropriÃ©taire`, `PÃ©remption`, `SantÃ©Prox`, `RefusÃ©e`.

Ce n'est pas un petit detail. Pour l'utilisateur, c'est un signal de produit non professionnel. Dans le domaine de la sante, un texte casse detruit la confiance immediatement.

Impact:

- perception de bug permanent;
- perte de credibilite;
- mauvaise lisibilite;
- risque d'incomprehension sur les actions sensibles;
- experience mediocre en francais.

Correction attendue:

- uniformiser tout le projet en UTF-8;
- corriger tous les textes casses dans les composants, les messages JSON et les donnees statiques;
- interdire les chaines francaises hardcodees non verifiees;
- utiliser les fichiers de traduction comme source principale pour les libelles publics et auth.

### 2. Champs mot de passe incoherents

Les formulaires login/register utilisent bien `PasswordInput` avec icone oeil. Mais d'autres formulaires sensibles utilisent encore des champs simples `Input type="password"`:

- changement de mot de passe admin;
- changement de mot de passe dans les parametres partages;
- activation gestionnaire/proprietaire/caissier;
- confirmation de mot de passe dans certains flux internes.

Pour l'utilisateur, c'est incoherent: parfois il peut verifier son mot de passe, parfois non. Sur mobile, cette absence augmente les erreurs de saisie. Sur un produit sante, c'est un detail qui se voit immediatement et qui donne une impression d'inacheve.

Correction attendue:

- remplacer tous les `Input type="password"` par le composant `PasswordInput`;
- ajouter `aria-label` au bouton oeil;
- ajouter un etat clair "Afficher/Masquer le mot de passe";
- verifier que le bouton oeil ne masque pas le texte tape et ne casse pas l'alignement.

### 3. Design system trop petit pour un produit grand public et operationnel

Les boutons et inputs partages sont regles autour de 32 px de hauteur (`h-8`). C'est trop petit pour une application qui doit etre utilisee sur mobile, tablette, comptoir de pharmacie, ordinateur administratif, parfois dans l'urgence.

Un champ de saisie de 32 px fatigue vite et provoque des erreurs. Un bouton de 32 px est acceptable dans une barre d'outils dense, mais pas comme standard global.

Correction attendue:

- inputs standards a 40 ou 44 px minimum;
- boutons principaux a 40 ou 44 px;
- tailles compactes reservees aux tables et filtres secondaires;
- zones tactiles mobiles d'au moins 44 px;
- labels et messages d'erreur plus lisibles.

### 4. Identite visuelle pas encore unifiee

Le projet utilise une palette medicale bleue, un theme pharmacie vert, un mode sombre gris-bleu, des gradients dans certaines zones, et une administration qui reprend une structure proche mais pas exactement la meme.

L'intention est bonne: differencier pharmacie, hopital, admin. Mais l'execution manque de discipline. Le produit doit donner l'impression d'une seule plateforme, pas de plusieurs applications qui se ressemblent vaguement.

Correction attendue:

- definir une direction artistique unique SanteProx;
- garder le bleu comme marque principale;
- utiliser le vert pharmacie comme accent contexte, pas comme seconde marque concurrente;
- definir une palette semantique stricte: succes, danger, warning, info, neutre;
- limiter les gradients aux zones ou ils apportent une vraie valeur;
- documenter les usages couleur par role et par contexte.

## Logo et marque

Le dossier public contient beaucoup de variantes: logos horizontaux, verticaux, icones light/dark, favicon, app icon, icones PWA, et une image dans `logo_mobile`.

Problemes observes:

- trop de variantes sans regle visible d'utilisation;
- risque d'incoherence entre favicon, PWA, sidebar, header public et mobile;
- logo vertical dans une sidebar de 80 px de haut avec largeur 140 et hauteur 124: cela peut donner une presence visuelle lourde;
- nom `logo-icon-darks.svg` suspect, probablement doublon ou erreur;
- fichiers par defaut Next/Vercel encore presents (`next.svg`, `vercel.svg`, etc.), ce qui fait brouillon.
- la page offline utilise `SanteProx` sans accent alors que le reste de la marque affiche parfois `SanteProx`, parfois la version accentuee via les traductions.

Correction attendue:

- definir une matrice d'usage: favicon, PWA Android, PWA iOS, sidebar ouverte, sidebar fermee, header public, ecran offline;
- supprimer les assets de demo inutiles;
- verifier le rendu du logo en clair, sombre, mobile, dashboard et PWA;
- garder une seule image source officielle pour les icones mobiles, puis generer les tailles necessaires.
- definir l'orthographe officielle visible: `SanteProx` sans accent ou `SantéProx` avec accent, puis l'appliquer partout sans variation.

## Page publique recherche/carte

Le concept recherche + carte est pertinent pour SanteProx. C'est probablement l'une des meilleures directions produit du projet. L'utilisateur final veut trouver rapidement une pharmacie, un hopital, un service ou un medicament proche de lui.

Mais l'interface actuelle est encore trop technique.

Problemes:

- la sidebar de recherche est dense;
- le header prend de la place sans clarifier le parcours;
- le mobile bascule entre recherche et carte, mais l'utilisateur peut perdre le contexte;
- la zone urgence, les resultats, l'historique et les suggestions manquent de hierarchie;
- trop de `z-index` tres eleves, ce qui annonce des risques de superposition;
- les resultats doivent mieux differencier hopital, pharmacie, disponibilite, distance, horaires et urgence;
- la carte doit avoir des etats vides, erreurs GPS, permission refusee, hors ligne et chargement plus humains.
- l'experience publique doit mieux rassurer sur la fraicheur des donnees: stock, horaires, distance et disponibilite doivent avoir une date ou un indicateur de confiance quand c'est utile.

Ce qu'il faut viser:

- une recherche centrale claire: "Que cherchez-vous ?" + localisation;
- des filtres rapides tres visibles: Pharmacies, Hopitaux, Medicaments, Urgences;
- des resultats avec priorite visuelle: ouvert maintenant, distance, stock/service disponible, action principale;
- une fiche structure plus riche et plus lisible;
- un mobile ou la bascule carte/liste conserve le contexte et le nombre de resultats.

## Authentification et onboarding

Base correcte:

- les formulaires login/register utilisent un composant `PasswordInput`;
- l'icone oeil existe dans ce composant;
- les erreurs passent par toast;
- validation avec schema.

Problemes:

- l'ecran auth est trop pauvre visuellement pour un produit de confiance;
- pas assez de contexte sur le role de la connexion;
- les boutons et champs sont trop petits;
- l'ecran manque de marque, aide, securite percue, lien support;
- certains formulaires mot de passe ailleurs utilisent encore `type="password"` directement;
- le bouton Google doit etre mieux integre avec les etats de chargement, erreur et confidentialite;
- les erreurs ne doivent pas seulement etre des toasts temporaires: il faut aussi afficher un message persistant proche du champ ou du formulaire.

Correction attendue:

- page auth en deux zones sur desktop: marque/confiance a gauche, formulaire a droite;
- version mobile tres simple, sans surcharge;
- champs mot de passe avec icone oeil partout, y compris settings admin/shared et activation;
- messages d'erreur persistants;
- indication claire apres invitation/pre-enregistrement;
- etats de chargement localises sur le bouton, pas seulement toast.
- un seul langage visuel pour les flux: connexion normale, Google, activation par email, OTP, creation de mot de passe.

## Dashboards

Les dashboards existent et sont modulaires, mais l'experience n'est pas encore au niveau d'un outil operationnel mature.

Problemes generaux:

- sidebar sans groupes metier;
- libelles parfois trop generiques: Dashboard, Historique, Alertes, Parametres;
- aucun contexte fort sur la structure active;
- header surcharge par notifications, deconnexion, profil;
- deconnexion trop visible et trop proche des actions courantes;
- fil d'Ariane cache sur mobile;
- spinner plein ecran sans texte dans certains guards;
- sidebar dynamique utile, mais elle doit mieux expliquer quand aucun module n'est disponible;
- la navigation admin et la navigation structure ne suivent pas exactement le meme langage visuel.
- le tableau de bord et un module metier peuvent etre confondus quand les libelles sont trop generiques.

Correction attendue:

- grouper la sidebar par familles: Pilotage, Operations, Stock, Equipe, Communication, Parametres;
- afficher la structure active dans le header ou la sidebar;
- rendre la deconnexion secondaire dans le menu profil;
- afficher des skeletons contextualises plutot qu'un spinner seul;
- prevoir des empty states utiles: pourquoi je ne vois aucun module, que faire, qui contacter;
- garder une densite plus forte dans les tables, mais plus d'espace dans les pages d'accueil.
- nommer les entrees selon l'action utilisateur: `Vue d'ensemble`, `Ventes`, `Caisse`, `Stock`, `Equipe`, au lieu de laisser `Dashboard` partout.

## Dashboard proprietaire

Le proprietaire gere plusieurs structures, les membres, permissions, modules, statistiques, stock, caisse, alertes et messagerie. C'est un role puissant. L'interface actuelle ne lui donne pas encore assez de pilotage.

Problemes:

- l'accueil proprietaire est trop simple pour un role central;
- les actions rapides repetent parfois les memes liens;
- la creation de structure et le pre-enregistrement collaborateur sont sur une meme page tres dense;
- la selection de structure n'est pas assez dominante;
- les permissions membre sont fonctionnelles mais visuellement lourdes;
- le proprietaire doit comprendre immediatement: structure active, membres actifs/suspendus, modules non configures, alertes critiques.
- la creation de structure, l'ajout de membre, l'activation/desactivation et les permissions sont des operations differentes; les mettre trop proches augmente la charge mentale.

Correction attendue:

- dashboard proprietaire oriente decision: structures, equipe, modules incomplets, alertes, activite recente;
- selection structure persistante et visible;
- permissions sous forme de matrice claire: lignes modules, colonnes actions;
- bouton "Appliquer un modele de permissions" pour caissier ou gestionnaire, puis personnalisation;
- messages clairs quand un membre n'a aucun module actif.
- workflow en trois etapes visibles: choisir structure, gerer equipe, regler permissions.

## Dashboard pharmacie equipe

Le concept de dashboard dynamique par permissions est le bon. Mais l'UX doit rendre cette logique visible.

Problemes:

- si un module n'est pas active, l'utilisateur peut croire a un bug;
- le dashboard doit distinguer "module non autorise" et "module en erreur";
- les modules visibles doivent etre expliques comme "actives par le proprietaire";
- le module caisse ne doit pas etre confondu avec le dashboard;
- les routes directes doivent afficher un refus propre, pas seulement rediriger ou spinner.
- les modules non actives ne doivent jamais rester visibles sous forme de menus figes par role.

Correction attendue:

- page d'accueil equipe neutre listant les modules autorises;
- carte module avec nom, description, action principale;
- bloc compte/profil/parametres separe des modules metier;
- page "Acces non autorise" propre si URL interdite;
- actualisation des permissions apres modification proprietaire.
- sidebar et page d'accueil construites depuis les permissions backend, avec etat vide comprehensible.

## Dashboard admin SanteProx

L'admin a une meilleure structure que certaines zones, avec sidebar, pages titres, cartes stats, map et tableaux. Mais l'experience reste tres CRUD.

Problemes:

- beaucoup de pages ressemblent a des tables sans priorisation;
- manque de vue de supervision claire;
- les actions sensibles suspendre/reactiver/supprimer doivent avoir une hierarchie visuelle plus stricte;
- la carte admin doit aider a prendre des decisions, pas seulement afficher des points;
- l'admin doit voir rapidement ce qui demande action: validations, incidents, feedback, structures incompletes, alertes systeme.

Correction attendue:

- dashboard admin centre sur supervision et file d'attente;
- stats orientees decision;
- tables avec colonnes prioritaires, filtres sauvegardes, recherche forte;
- modales de confirmation plus explicites pour actions destructives.

## Tables, filtres et donnees metier

Les tables actuelles sont simples, mais insuffisantes pour un volume eleve.

Problemes:

- pas toujours de tri visible;
- pas toujours de pagination claire;
- actions icon-only sans tooltip dans certaines tables;
- colonnes pas toujours priorisees;
- espaces et hauteurs pas optimises;
- etats vides trop pauvres;
- filtres parfois dans une carte separee qui prend trop de place.
- les pages a fort volume comme stock, vente, historique, factures et utilisateurs doivent privilegier la vitesse de lecture, pas une succession de cartes.

Correction attendue:

- tables avec header sticky pour grands volumes;
- tri et filtres alignes au-dessus de la table;
- recherche dans les modules metier;
- actions icon-only avec tooltip et aria-label;
- colonnes critiques visibles en premier;
- badges statuts harmonises;
- empty states qui disent quoi faire ensuite.
- virtualisation ou pagination robuste pour les grandes listes.

## Formulaires

Les formulaires fonctionnent mais manquent de finition.

Problemes:

- labels parfois trop techniques;
- placeholders parfois inutiles ou non accentues;
- champs trop bas;
- boutons alignes dans des grilles difficiles a lire;
- erreurs pas toujours proches des champs;
- pas assez d'aide contextuelle sur les actions sensibles;
- certains champs role sont libres alors que l'interface devrait guider le proprietaire.

Correction attendue:

- hauteur champ 40/44 px;
- erreurs inline;
- aides courtes sous les champs complexes;
- separation visuelle entre creation, selection et edition;
- confirmation claire apres sauvegarde;
- etats disabled expliques quand l'action est impossible.

## Couleurs

La palette actuelle est medicale mais pas encore assez disciplinee.

Ce qui marche:

- bleu medical principal credible;
- vert pharmacie logique;
- mode sombre doux, pas noir pur;
- couleurs semantiques deja prevues.

Ce qui ne marche pas:

- trop de dependance a `primary` selon le theme, ce qui fait changer l'identite;
- danger en version destructive parfois trop douce pour une action grave;
- warning peu visible selon les fonds;
- gradients pharmacie dans sidebar/header pas toujours necessaires;
- badges et cartes n'ont pas toujours une hierarchie semantique claire.

Correction attendue:

- une charte couleur stricte;
- tokens par intention: brand, surface, border, success, warning, danger, info;
- contraste verifie WCAG;
- danger plus explicite pour suppression/desactivation;
- primary stable pour la marque, accent contextuel pour pharmacie/hopital.

## Typographie

La typographie utilise system-ui. C'est robuste et performant, mais la hierarchie typographique est trop plate.

Problemes:

- beaucoup de textes `text-sm`;
- titres de pages souvent identiques, peu expressifs;
- tables et cartes manquent de niveaux;
- textes d'aide trop petits;
- certains libelles sont sans accents ou mal encodes;
- `tracking-wide uppercase` sur petits titres peut fatiguer la lecture.

Correction attendue:

- definir une echelle typographique: page title, section title, label, body, meta, caption;
- utiliser le poids de police avec parcimonie;
- limiter uppercase aux labels courts;
- corriger accents partout;
- prevoir une densite "compacte" seulement pour utilisateurs avances.

## Accessibilite

Le projet utilise de bons composants de base, mais plusieurs points doivent etre controles.

Risques:

- boutons icon-only sans aria-label;
- boutons oeil mot de passe sans libelle accessible;
- contrastes a verifier en dark et theme pharmacie;
- focus visible parfois faible;
- navigation mobile et sheets a tester au clavier;
- badges couleur sans texte explicite parfois insuffisants;
- messages toast seuls non suffisants pour erreurs critiques.
- cible tactile parfois inferieure au confort attendu sur mobile.

Correction attendue:

- aria-label sur tous les boutons icon-only;
- tooltips sur actions icon-only;
- role/status pour alertes;
- focus visible fort;
- tests clavier sur login, dashboard, sidebar, modales;
- erreurs persistantes, pas uniquement toast.
- audit Lighthouse/accessibilite sur pages publiques, auth et dashboards.

## Responsive

Le projet prend le mobile au serieux, surtout sur la carte publique. Mais plusieurs patterns restent fragiles.

Problemes:

- grilles de formulaires trop larges;
- tables seulement `overflow-x-auto`, ce qui est acceptable mais pas ideal mobile;
- sidebar dashboard mobile sous forme sheet, bonne base mais peu contextualisee;
- cartes trop nombreuses sur petits ecrans;
- boutons avec texte long peuvent devenir serres.

Correction attendue:

- versions mobile dediees pour tables critiques;
- formulaires en une colonne sur mobile;
- actions principales sticky en bas pour workflows caisse/vente;
- navigation mobile dashboard plus explicite;
- tester 360 px, 390 px, tablette et desktop large.

## Performance percue

L'utilisateur a deja signale des lenteurs et des recompilations. Meme si cela peut venir du dev server, l'UX doit masquer les attentes correctement.

Problemes:

- beaucoup de dynamic imports avec skeletons basiques;
- spinners generiques;
- routes qui peuvent sembler bloquer;
- certaines pages attendent structure + permissions + donnees metier sans feedback detaille.

Correction attendue:

- skeletons qui ressemblent aux ecrans finaux;
- messages de chargement contextualises;
- prefetch controle mais coherent;
- eviter les spinners plein ecran sauf initialisation globale;
- cache permissions/structure bien synchronise.

## Microcopy et langage produit

Le langage est souvent fonctionnel mais pas encore produit.

Problemes:

- melange accents corrects, accents casses et absence d'accents;
- libelles trop bruts: "Creer", "Parametres", "Membres de la structure";
- messages vides peu utiles;
- role libre dans certains formulaires peut derouter;
- certains textes disent ce que le systeme fait, pas ce que l'utilisateur doit comprendre.

Correction attendue:

- ton clair, court, rassurant;
- terminologie stable: proprietaire, gestionnaire, caissier, structure, module, permission;
- messages d'action qui indiquent le resultat;
- empty states avec prochaine action;
- validation des libelles par parcours.

## Priorites de redesign

### Priorite 1 - Confiance et lisibilite

- corriger tous les textes casses;
- augmenter hauteur inputs/boutons;
- harmoniser couleur et typographie;
- nettoyer assets logo inutiles;
- ajouter aria-label/tooltips sur actions icon-only.

### Priorite 2 - Dashboards operationnels

- grouper les sidebars;
- afficher structure active;
- ameliorer header et menu profil;
- creer une page equipe dynamique claire;
- remplacer spinners generiques par etats contextualises.

### Priorite 3 - Parcours metier

- revoir vente/caisse/stock avec priorite d'action;
- rendre filtres et recherches plus efficaces;
- optimiser tables pour gros volume;
- ajouter empty/error states utiles;
- rendre permissions proprietaire lisibles en matrice.

### Priorite 4 - Produit a grande echelle

- systematiser design tokens;
- documenter composants et usages;
- verifier WCAG;
- tester responsive reel;
- auditer performance percue;
- stabiliser PWA/offline/notifications avec UX propre.

## Pages a revoir en premier

1. Connexion / inscription / activation compte: c'est la porte d'entree. Elle doit etre propre, rassurante, coherente et sans champ mot de passe incomplet.

2. Recherche publique + carte: c'est la promesse centrale de SanteProx. La recherche doit etre immediate, lisible, et orientee resultat utile.

3. Dashboard proprietaire: c'est le centre de controle. Il doit rendre evidents les structures, les membres, les permissions, les alertes et les actions urgentes.

4. Dashboard pharmacie equipe: c'est la zone la plus sensible actuellement. Elle doit afficher uniquement les modules autorises, expliquer les absences et separer clairement accueil, vente et caisse.

5. Stock / vente / caisse / factures: ce sont les workflows operationnels. Ils doivent etre rapides, tres lisibles, et optimises pour les erreurs humaines.

6. Administration SanteProx: elle doit passer d'un CRUD propre a une console de supervision.

## Indicateurs de qualite a imposer

- aucun texte casse ou mal encode visible;
- aucune action icon-only sans tooltip et nom accessible;
- aucun champ mot de passe sans icone afficher/masquer;
- aucun spinner plein ecran sans contexte;
- aucun module pharmacie equipe visible sans permission active;
- contraste verifie en clair, sombre, pharmacie et admin;
- navigation testee sur mobile, tablette et desktop;
- pages metier capables de rester lisibles avec beaucoup de donnees;
- empty states utiles avec prochaine action claire;
- coherence stricte du logo et du nom de marque.

## Conclusion

SanteProx n'est pas loin d'une bonne base produit, mais le design actuel n'est pas encore au niveau d'une plateforme de sante a grande echelle. Le code montre une intention serieuse, mais l'interface manque de finition, de coherence et de rigueur visuelle.

La premiere bataille n'est pas de rajouter des pages. C'est de rendre chaque page lisible, fiable et digne de confiance. Les corrections prioritaires sont simples mais importantes: textes propres, composants plus confortables, navigation mieux organisee, couleurs disciplinees, formulaires plus humains, et parcours metier centres sur l'action principale.

Une fois cette base corrigee, les modules existants auront beaucoup plus de valeur sans necessiter une reconstruction complete.
