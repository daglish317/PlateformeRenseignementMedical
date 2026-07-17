BLOC 1 — Authentification (Connexion & Création de compte)
Objectif

Mettre en place toute l'infrastructure d'authentification de SantéProx.

Ce bloc doit permettre :

création d'un compte utilisateur public ;
connexion avec email et mot de passe ;
connexion avec Google ;
création de compte avec Google ;
gestion des JWT ;
récupération de l'utilisateur connecté ;
persistance de la session ;
déconnexion.

Aucune logique de redirection métier n'est implémentée dans ce bloc.

Architecture

Créer une feature indépendante.

src/features/auth/

├── api/
│   ├── auth.service.ts
│   ├── google-auth.service.ts
│   └── token.service.ts
│
├── hooks/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useGoogleLogin.ts
│   ├── useGoogleRegister.ts
│   ├── useLogout.ts
│   ├── useCurrentUser.ts
│   └── useRefreshToken.ts
│
├── store/
│   └── auth-store.ts
│
├── types/
│   ├── auth.ts
│   └── user.ts
│
├── validation/
│   ├── login.schema.ts
│   └── register.schema.ts
│
├── utils/
│   ├── auth-storage.ts
│   └── auth-errors.ts
│
└── components/
    ├── AuthCard.tsx
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    ├── PasswordInput.tsx
    ├── GoogleButton.tsx
    ├── Divider.tsx
    └── AuthLayout.tsx
Pages à créer

Créer :

src/app/[locale]/connexion/page.tsx

Créer :

src/app/[locale]/inscription/page.tsx
Champs du formulaire d'inscription

Uniquement :

Nom

Email

Mot de passe

Confirmation du mot de passe
Champs du formulaire de connexion
Email

Mot de passe
Fonctionnalités obligatoires
Connexion classique
Email

↓

Mot de passe

↓

JWT
Création de compte
Nom

↓

Email

↓

Mot de passe

↓

Création utilisateur
Connexion Google

Prévoir un bouton :

Continuer avec Google

Le frontend ne contient aucune logique OAuth.

Il appelle uniquement le backend.

Création avec Google

Même bouton.

Le backend décide :

utilisateur existant → connexion ;
utilisateur inexistant → création puis connexion.
Gestion JWT

Prévoir :

Access Token ;
Refresh Token ;
rafraîchissement automatique ;
déconnexion.
Store Auth

Créer :

src/features/auth/store/auth-store.ts

Il contient uniquement :

user

accessToken

refreshToken

authenticated
Validation

Créer :

src/features/auth/validation/login.schema.ts

Créer :

src/features/auth/validation/register.schema.ts

Utiliser Zod.

Composants UI

Créer :

PasswordInput.tsx

Champ mot de passe avec :

afficher ;
masquer.

Créer :

GoogleButton.tsx

Bouton Google réutilisable.

Créer :

Divider.tsx

Affiche :

──────── OU ────────

entre :

Connexion classique

et

Google.

Fichiers existants à modifier

Modifier :

src/components/layout/header/HeaderActions.tsx

Le Header doit afficher :

Non connecté :

Connexion

Créer un compte

Connecté :

Profil

Favoris

Déconnexion
Résultat attendu du bloc 1

À la fin de ce bloc :

✅ inscription

✅ connexion

✅ Google

✅ JWT

✅ utilisateur connecté

✅ déconnexion

BLOC 2 — Redirection intelligente selon le rôle
Objectif

Une fois l'utilisateur authentifié, l'application doit automatiquement ouvrir la bonne interface.

Aucun composant React ne doit contenir cette logique.

Toute la logique est centralisée.

Architecture

Créer :

src/features/auth/utils/redirect.ts

Responsabilité :

Recevoir l'utilisateur connecté.

Retourner la route à ouvrir.

Créer :

src/features/auth/hooks/useAuthRedirect.ts

Responsabilité :

Appeler :

redirect.ts

Puis utiliser :

next/navigation
Flux

Connexion

↓

Utilisateur authentifié

↓

Analyse du rôle

↓

Redirection

Cas possibles
Administrateur

↓

/admin
Gestionnaire

↓

Lire la structure associée.

Si :

Structure = HOPITAL

↓

/gestionnaire/hopital

Si :

Structure = PHARMACIE

↓

/gestionnaire/pharmacie
Utilisateur public

↓

/
Route Guards

Créer :

src/features/auth/components/ProtectedRoute.tsx

Protège :

Dashboard Admin ;
Dashboard Pharmacie ;
Dashboard Hôpital.

Créer :

src/features/auth/components/GuestRoute.tsx

Empêche un utilisateur connecté d'ouvrir :

connexion ;
inscription.
Fichiers existants à modifier

Modifier :

src/components/layout/header/Header.tsx

Le Header doit s'adapter automatiquement selon l'état de connexion.

Modifier :

src/components/layout/PublicLayout.tsx

Utiliser l'état d'authentification pour afficher les actions appropriées.

Résultat attendu du bloc 2

À la fin de ce bloc :

l'utilisateur est authentifié ;
sa session est restaurée automatiquement ;
Google fonctionne comme l'authentification classique ;
les pages de connexion et d'inscription sont protégées si l'utilisateur est déjà connecté ;
chaque utilisateur est redirigé automatiquement vers son interface selon son rôle et, pour un gestionnaire, selon le type de structure (hôpital ou pharmacie). Aucun composant d'interface ne contient cette logique.