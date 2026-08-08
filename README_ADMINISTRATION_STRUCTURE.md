# Administration des structures

## Objectif

Adapter le modele actuel sans tout refaire : l'administrateur SanteProx ne cree plus un gestionnaire de structure, il cree/invite le proprietaire. Le proprietaire devient responsable de sa structure et pourra ensuite inviter les membres internes.

## Decisions actees

- `ADMINISTRATEUR` reste le role plateforme pour SanteProx.
- `PATIENT` reste le role public.
- `PROPRIETAIRE`, `GESTIONNAIRE` et `CAISSIER` sont ajoutes comme roles applicatifs utilisables par l'authentification et les redirections.
- Une structure ne doit plus etre pensee comme appartenant a un gestionnaire unique.
- Le lien utilisateur/structure/role interne est porte par `EquipeStructure`.
- L'ancien flux d'invitation gestionnaire est conserve comme base technique, mais il est remplace fonctionnellement par l'invitation proprietaire.
- L'administrateur SanteProx invite uniquement le proprietaire. Il ne cree plus de structure pour lui.
- Un proprietaire peut creer plusieurs structures apres activation.
- Les gestionnaires et caissiers sont assignes a une structure precise.

## Phase en cours

Phase 1 : socle roles, invitations et redirections.

Inclus :

- Ajouter les roles `PROPRIETAIRE` et `CAISSIER`. Fait.
- Ajouter le modele `EquipeStructure`. Fait.
- Assouplir `Structure` pour permettre une creation initiale par l'admin avec informations minimales. Fait.
- Remplacer l'invitation admin de gestionnaire par une invitation proprietaire. Fait cote backend.
- Adapter les redirections frontend pour envoyer le proprietaire vers le flux structure. Fait pour le socle.

## Changements backend realises

- `Utilisateur.role` accepte maintenant `PROPRIETAIRE` et `CAISSIER`.
- `Structure.gestionnaire` est conserve temporairement pour compatibilite, mais devient optionnel.
- `Structure.adresse` et `Structure.telephone` deviennent optionnels pour permettre a l'admin de creer une structure minimale.
- `EquipeStructure` relie un utilisateur a une structure avec un role interne et un statut.
- L'ancien service d'invitation gestionnaire sert maintenant de base a `inviter_proprietaire`.
- L'activation d'un invite active aussi son appartenance dans `EquipeStructure`.
- `structures/me/` retrouve la structure via `EquipeStructure`.
- L'ancien endpoint admin des gestionnaires est garde pour compatibilite mais cree/liste maintenant des proprietaires.
- L'invitation proprietaire ne cree plus automatiquement une structure.
- Ajout de l'API `GET /api/structures/owner/` pour lister les structures du proprietaire.
- Ajout de l'API `POST /api/structures/owner/` pour creer une structure rattachee au proprietaire.

## Changements frontend realises

- Les roles frontend acceptent maintenant `PROPRIETAIRE` et `CAISSIER`.
- La redirection apres connexion envoie `PROPRIETAIRE` et `GESTIONNAIRE` vers l'entree structure existante `/gestionnaire`.
- La redirection apres activation OTP utilise la redirection centralisee par role.
- Les dashboards structure acceptent `PROPRIETAIRE` et `GESTIONNAIRE`.
- L'ancienne modale admin de creation de gestionnaire sert maintenant a inviter un proprietaire avec une structure minimale.
- L'ancienne modale admin de creation de gestionnaire sert maintenant a inviter un proprietaire avec nom et email uniquement.
- La redirection `PROPRIETAIRE` pointe vers `/owner`.
- La route `/owner` est preparee comme emplacement du futur dashboard proprietaire.

## Phase 2 : Mon equipe

Realise :

- Ajout de l'API `GET /api/structures/team/` pour lister les membres de la structure courante.
- Ajout de l'API `POST /api/structures/team/` pour que le proprietaire invite un `GESTIONNAIRE` ou un `CAISSIER`.
- Les APIs equipe utilisent maintenant `structure_id` pour cibler la structure concernee.
- Ajout du module frontend partage `features/shared/team`.
- Ajout de la page `Mon equipe` pour les dashboards structure.
- La page `Mon equipe` permet au proprietaire de creer plusieurs structures.
- La page `Mon equipe` oblige a choisir une structure avant d'inviter un gestionnaire ou un caissier.
- Branchement hopital sur `/hospital/employees`.
- Branchement pharmacie sur `/pharmacy/team`.
- Ajout de l'entree de navigation `Mon equipe` dans les dashboards hopital et pharmacie.

## Verifications

- `python manage.py makemigrations utilisateurs structures` : OK.
- `python manage.py check` : OK.
- `npm run lint` : OK, avec avertissements existants non lies.
- `npm run build` : OK.
- `python manage.py migrate` : OK, migrations appliquees localement.
- Apres ajout de `Mon equipe`, `python manage.py check` : OK.
- Apres ajout de `Mon equipe`, `npm run lint` : OK, avec avertissements existants non lies.
- Apres ajout de `Mon equipe`, `npm run build` : OK.
- Apres passage proprietaire multi-structures, `python manage.py check` : OK.
- Apres passage proprietaire multi-structures, `npm run lint` : OK, avec avertissements existants non lies.
- Apres passage proprietaire multi-structures, `npm run build` : OK.

Hors perimetre pour cette phase :

- Suspension/reactivation des membres depuis l'interface.
- Renvoi d'invitation.
- Permissions fines par fonctionnalite.
- Caisse, ventes, paiements et factures.
- Audit complet des actions metier.
