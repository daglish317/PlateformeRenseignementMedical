# Visibilite - correctifs de redirection et de garde d'acces

## Corrections appliquees

- Redirection apres authentification :
  - `GESTIONNAIRE` vers `/pharmacy`
  - `CAISSIER` vers `/caissier`
  - `PROPRIETAIRE` et `ADMINISTRATEUR` conservent leurs espaces respectifs
- Neutralisation du flux legacy `frontend/src/app/[locale]/gestionnaire/setup/page.tsx` :
  - la page ne propose plus de creation/configuration de structure ;
  - elle redirige vers l'espace adapte selon le role courant.
- Stabilisation du garde partagé `DashboardRoute` :
  - plus de redirection automatique vers `/gestionnaire/setup` en cas d'erreur de chargement ;
  - les routes bloquées redirigent vers la racine du dashboard concerné ;
  - le composant ne reste plus bloqué sur un spinner à cause d'une structure absente.
- UX des permissions membre :
  - regroupement visuel des modules par catégories ;
  - message explicite lorsqu'aucune permission n'est encore active ;
  - l'éditeur reste cohérent avec les actions réellement exposées par le registre.
- Backend permissions :
  - refus d'un enregistrement de permissions vide pour éviter un membre opérationnel sans accès réel ;
  - validation sérialisée propre au lieu d'une erreur brute.

## Fichiers modifies

- `frontend/src/features/auth/utils/redirect.ts`
- `frontend/src/app/[locale]/gestionnaire/page.tsx`
- `frontend/src/app/[locale]/gestionnaire/setup/page.tsx`
- `frontend/src/features/shared/dashboard/layout/DashboardRoute.tsx`
- `frontend/src/features/shared/team/components/MemberPermissionsEditor.tsx`
- `backend/structures/permission_service.py`
- `backend/structures/serializers.py`
- `backend/structures/tests.py`

## Verification

- `npm run build` dans `frontend/` : OK
- `npm run lint` dans `frontend/` : OK, 0 erreur, warnings historiques uniquement
- `..\\backend\\env\\Scripts\\python.exe manage.py test structures --keepdb` : OK
- `..\\backend\\env\\Scripts\\python.exe -m py_compile structures\\permission_service.py structures\\serializers.py structures\\tests.py` : OK
