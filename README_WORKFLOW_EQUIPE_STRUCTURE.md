# Workflow equipe structure - SantéProx

## Objectif

Cette phase modifie le workflow d'ajout des membres d'une structure par le propriétaire.

Avant, l'ajout d'un gestionnaire ou d'un caissier pouvait être assimilé à une invitation email.

Maintenant :

- seul l'admin SantéProx envoie un email au propriétaire créé ;
- le propriétaire pré-enregistre les gestionnaires et caissiers dans l'équipe d'une structure ;
- aucun email ni OTP n'est envoyé aux gestionnaires et caissiers ;
- les gestionnaires et caissiers créent eux-mêmes leur compte depuis la page normale d'inscription.

## Règle principale

Le propriétaire renseigne :

- la structure ;
- le nom provisoire du collaborateur ;
- l'email ;
- le rôle : `GESTIONNAIRE` ou `CAISSIER`.

Le système crée un utilisateur inactif :

- `is_active = False`
- `email_verifie = False`
- rôle `GESTIONNAIRE` ou `CAISSIER`

Puis crée son appartenance à l'équipe :

- `EquipeStructure.statut = INVITE`

Aucun email n'est envoyé.

## Activation du compte collaborateur

Le collaborateur va sur la page normale d'inscription :

- `/inscription`

Il renseigne :

- le même email que celui saisi par le propriétaire ;
- son nom ;
- son mot de passe.

Si l'email correspond à un compte `GESTIONNAIRE` ou `CAISSIER` inactif et rattaché à une équipe en statut `INVITE`, le backend n'essaie pas de créer un nouveau patient.

Il active le compte existant :

- met à jour le nom ;
- définit le mot de passe ;
- passe `is_active` à `True` ;
- passe `email_verifie` à `True` ;
- passe l'appartenance d'équipe à `ACTIF` ;
- retourne les tokens JWT.

La redirection se fait ensuite selon le rôle :

- `GESTIONNAIRE` vers `/pharmacy` ;
- `CAISSIER` vers `/caissier` ;
- `PROPRIETAIRE` vers `/owner`.

## Propriétaire créé par SantéProx

Le flux email + OTP reste réservé au propriétaire créé par l'admin SantéProx.

Le service `InvitationService.inviter_proprietaire` :

- crée le propriétaire inactif ;
- génère l'OTP ;
- déclenche l'événement `USER_INVITED` ;
- envoie l'email via le système d'événements.

Le formulaire d'activation spécial de la page inscription est conservé pour ce cas propriétaire.

## Changements backend

Fichiers principaux :

- `backend/utilisateurs/services/invitation_service.py`
- `backend/utilisateurs/serializers.py`
- `backend/structures/views.py`
- `backend/utilisateurs/views_admin.py`

Comportements importants :

- `inviter_gestionnaire` et `inviter_caissier` ne génèrent pas d'OTP.
- `inviter_gestionnaire` et `inviter_caissier` ne déclenchent pas `USER_INVITED`.
- `RegisterSerializer` accepte un email déjà existant uniquement si cet email correspond à un gestionnaire ou caissier inactif, pré-enregistré dans une équipe.
- Le endpoint équipe propriétaire utilise le `structure_id` fourni, puis vérifie que la structure appartient au propriétaire. Cela respecte le modèle multi-structures.

## Changements frontend

Fichiers principaux :

- `frontend/src/app/[locale]/inscription/page.tsx`
- `frontend/src/features/auth/utils/redirect.ts`
- `frontend/src/features/shared/team/pages/TeamPage.tsx`
- `frontend/src/features/shared/team/hooks/useInviteStructureMember.ts`
- `frontend/src/app/[locale]/gestionnaire/page.tsx`
- `frontend/src/app/[locale]/gestionnaire/setup/page.tsx`

Comportements importants :

- la page normale d'inscription active automatiquement un gestionnaire ou caissier pré-enregistré ;
- le lien d'activation spécial parle maintenant du propriétaire invité ;
- le gestionnaire est redirigé vers `/pharmacy` après authentification ;
- la page `/gestionnaire/success` a été supprimée ;
- les redirections restantes vers `/gestionnaire/success` ont été retirées ;
- l'interface propriétaire parle de pré-enregistrement, pas d'envoi d'invitation email.

## Points de sécurité

Un utilisateur ne peut pas choisir librement de devenir gestionnaire ou caissier.

Le backend n'active un compte structure depuis `/register/` que si :

- l'email existe déjà ;
- le compte est inactif ;
- le compte n'est pas vérifié ;
- le rôle est `GESTIONNAIRE` ou `CAISSIER` ;
- une appartenance `EquipeStructure` en statut `INVITE` existe.

Sinon, l'inscription suit le flux patient normal ou refuse l'email déjà utilisé.

## Verification

Commandes executees sur cette phase :

```powershell
cd backend
..\backend\env\Scripts\python.exe manage.py check
..\backend\env\Scripts\python.exe manage.py makemigrations --check --dry-run
..\backend\env\Scripts\python.exe -m py_compile utilisateurs\serializers.py utilisateurs\views.py structures\views.py utilisateurs\views_admin.py
..\backend\env\Scripts\python.exe manage.py test utilisateurs structures
```

```powershell
cd frontend
npm run lint
npm run build
```

Resultats :

- Django check : OK.
- Controle migrations : OK, aucun changement detecte.
- Compilation Python ciblee : OK.
- Tests `utilisateurs` et `structures` : OK, 14 tests.
- Lint frontend : OK avec 12 avertissements existants, 0 erreur.
- Build frontend : OK.

Controles cibles :

- aucune reference active a `/gestionnaire/success` dans `frontend/src` ;
- `USER_INVITED` reste declenche par le flux proprietaire, pas par le pre-enregistrement gestionnaire/caissier.

## Correction acces espace pharmacie

Probleme observe :

- apres connexion d'un gestionnaire pharmacie, le toast indiquait une connexion reussie ;
- la route `/pharmacy` restait ensuite bloquee sur le spinner.

Cause :

- le garde `DashboardRoute` autorisait bien le role `GESTIONNAIRE` sur l'espace pharmacie ;
- mais il bloquait l'affichage si la structure n'avait pas le statut `ACTIVE` ;
- une structure creee par le proprietaire peut etre encore `EN_ATTENTE` ;
- comme le type etait deja `PHARMACIE`, le garde redirigeait vers `/pharmacy`, donc vers la meme page, et le spinner restait affiche.

Correction :

- `DashboardRoute` verifie toujours l'authentification, le role et le type de structure ;
- il ne bloque plus l'affichage uniquement parce que la structure est `EN_ATTENTE` ;
- le statut reste disponible dans le dashboard pour etre affiche ou exploite par les pages metier.

Verification apres correction :

- `npm run lint` : OK avec 12 avertissements existants, 0 erreur.
- `npm run build` : OK.
- `..\backend\env\Scripts\python.exe manage.py check` : OK.

## Activation et desactivation des collaborateurs

Fonctionnalite ajoutee :

- le proprietaire peut activer ou desactiver un `GESTIONNAIRE` ou un `CAISSIER` depuis la page equipe ;
- l'action est disponible uniquement sur les membres gestionnaires et caissiers ;
- le proprietaire de la structure ne peut pas etre suspendu depuis cette action ;
- le backend verifie que l'utilisateur connecte est bien proprietaire de la structure du membre cible.

Regles backend :

- `DEACTIVATE` passe l'appartenance `EquipeStructure` en `SUSPENDU` et met `Utilisateur.is_active = False` ;
- `ACTIVATE` sur un collaborateur deja inscrit remet l'appartenance en `ACTIF` et `Utilisateur.is_active = True` ;
- `ACTIVATE` sur un collaborateur suspendu qui n'a pas encore finalise son inscription remet l'appartenance en `INVITE` et garde `Utilisateur.is_active = False`.

Fichiers principaux :

- `backend/structures/serializers.py`
- `backend/structures/views.py`
- `backend/structures/urls.py`
- `backend/structures/tests.py`
- `frontend/src/features/shared/team/api/team.service.ts`
- `frontend/src/features/shared/team/hooks/useUpdateStructureMemberStatus.ts`
- `frontend/src/features/shared/team/pages/TeamPage.tsx`
- `frontend/src/features/shared/team/types/team.ts`

Verification apres ajout :

- `..\backend\env\Scripts\python.exe manage.py test structures` : OK, 5 tests.
- `..\backend\env\Scripts\python.exe manage.py check` : OK.
- `..\backend\env\Scripts\python.exe manage.py makemigrations --check --dry-run` : OK, aucun changement detecte.
- `..\backend\env\Scripts\python.exe -m py_compile structures\serializers.py structures\views.py structures\urls.py structures\tests.py` : OK.
- `npm run lint` : OK avec 12 avertissements existants, 0 erreur.
- `npm run build` : OK.
