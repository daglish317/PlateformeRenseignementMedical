# Configuration PWA SanteProx

## Objectif

Permettre l'installation de SanteProx sur l'ecran d'accueil Android, iOS et desktop via les capacites PWA du navigateur.

## Etat verifie

- Le projet utilise Next.js 16 avec l'App Router.
- La route `/manifest.webmanifest` est generee par `frontend/src/app/manifest.ts`.
- Le dossier source d'icone demande est `frontend/public/logo_mobile`.
- L'image source utilisee est `frontend/public/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png`.
- Cette image source est rectangulaire (`1489x704`), donc elle ne peut pas etre declaree directement comme icone PWA `192x192` ou `512x512`.

## Corrections appliquees

### 1. Configuration Next PWA robuste

Fichier concerne :

- `frontend/next.config.ts`

Ce qui a ete fait :

- la configuration tente d'utiliser `@ducanh2912/next-pwa` si le package est installe ;
- si l'installation npm echoue a cause de la connexion, le projet ne casse pas ;
- la PWA native reste fonctionnelle avec le manifest et `public/sw.js` ;
- le plugin est desactive en developpement pour eviter les caches agressifs pendant le travail.

### 2. Manifest PWA complet

Fichier concerne :

- `frontend/src/app/manifest.ts`

Ce qui a ete fait :

- ajout de `id`, `start_url`, `scope`, `display`, `orientation`, `theme_color`, `background_color` ;
- ajout des categories PWA ;
- ajout des icones Android/Chrome en `192x192` et `512x512` ;
- ajout des variantes `maskable` separees, car Next 16 n'accepte pas `purpose: "any maskable"`.

### 3. Metadata iOS et Android

Fichier concerne :

- `frontend/src/app/layout.tsx`

Ce qui a ete fait :

- ajout de `manifest: "/manifest.webmanifest"` ;
- ajout de `viewport.themeColor` ;
- ajout de `appleWebApp.capable` ;
- ajout du titre iOS ;
- ajout des icones standards et Apple Touch ;
- ajout du composant d'enregistrement du service worker.

### 4. Enregistrement du service worker

Fichier concerne :

- `frontend/src/components/pwa/PwaRegister.tsx`

Ce qui a ete fait :

- creation d'un composant client dedie ;
- inscription de `/sw.js` quand l'application tourne en production ;
- l'echec d'inscription du service worker ne bloque jamais l'application.

### 5. Service worker natif

Fichier concerne :

- `frontend/public/sw.js`

Ce qui a ete fait :

- creation d'un service worker simple ;
- cache des assets PWA principaux ;
- fallback de navigation vers `/fr` en cas d'indisponibilite reseau ;
- exclusion des appels `/api/` pour eviter de mettre en cache les donnees backend sensibles ou dynamiques.

### 6. Icones PWA derivees du dossier `logo_mobile`

Fichiers concernes :

- `frontend/public/pwa/icon-192.png`
- `frontend/public/pwa/icon-192-maskable.png`
- `frontend/public/pwa/icon-512.png`
- `frontend/public/pwa/icon-512-maskable.png`
- `frontend/public/pwa/apple-touch-icon.png`

Ce qui a ete fait :

- generation des icones depuis `frontend/public/logo_mobile/Gemini_Generated_Image_loefffloefffloef.png` ;
- `icon-192.png` : `192x192` ;
- `icon-192-maskable.png` : `192x192` ;
- `icon-512.png` : `512x512` ;
- `icon-512-maskable.png` : `512x512` ;
- `apple-touch-icon.png` : `180x180`.

## Point important sur `@ducanh2912/next-pwa`

Au moment de la verification, le package `@ducanh2912/next-pwa` n'etait pas encore present dans `package.json` ni dans `node_modules`.

Deux tentatives d'installation ont ete faites :

```powershell
npm install @ducanh2912/next-pwa --legacy-peer-deps
```

Resultat :

- premiere tentative : expiration du delai sans installation ;
- seconde tentative : echec reseau `ECONNRESET` pendant le telechargement depuis `https://registry.npmjs.org`.

La configuration est donc volontairement tolerante :

- si le package s'installe correctement, Next l'utilisera ;
- si le package n'est pas installe, le build ne casse pas ;
- la configuration native conserve le manifest, les icones et le service worker.
- si le plugin est installe plus tard, il generera `public/next-pwa-sw.js` afin de ne pas ecraser le service worker natif `public/sw.js`.

## Page offline personnalisee

Fichier concerne :

- `frontend/src/app/offline/page.tsx`

Ce qui a ete fait :

- creation d'une vraie page hors connexion SanteProx ;
- affichage de l'icone PWA issue de `public/logo_mobile` ;
- message clair indiquant que les donnees temps reel reviendront avec le reseau ;
- lien de retour vers `/fr`.

Le service worker `frontend/public/sw.js` precache maintenant `/offline` et l'utilise comme fallback de navigation quand le reseau est indisponible.

## Notifications push et clics

Fichiers concernes :

- `backend/notifications/push_service.py`
- `frontend/src/sw.ts`
- `backend/notifications/views.py`

Ce qui a ete fait :

- ajout d'une charge utile push avec `click_url` pour diriger l'utilisateur vers la page metier la plus pertinente ;
- routage du clic vers la page concernee du dashboard proprietaire si le `click_url` n'est pas fourni ;
- conservation d'un fallback par `nav_item` pour les notifications deja en circulation ;
- ouverture du bon espace en gardant la locale courante quand elle est detectee dans une fenetre deja ouverte.

Redirections mises en place :

- `alertes` -> `/owner/alertes`
- `messages` -> `/owner/chat`
- `stock` et `inventaires` -> `/owner/inventaires`
- `history` -> `/owner/history`
- `caisse` -> `/owner/caisse`
- `statistics` -> `/owner/statistics`
- `profil` -> `/owner/profile`
- `team` et `structures` -> `/owner/team`
- `settings` -> `/owner/settings`

## Activation des notifications

Fichiers concernes :

- `frontend/src/features/shared/settings/components/PushNotificationsCard.tsx`
- `frontend/src/features/shared/settings/api/push-notifications.service.ts`
- `frontend/src/features/shared/settings/pages/SettingsPage.tsx`

Ce qui a ete fait :

- ajout d'un interrupteur push dans les parametres partages ;
- affichage reserve au proprietaire ;
- activation via permission navigateur + subscription Web Push ;
- desactivation locale de l'appareil courant sans affecter les autres appareils du meme proprietaire ;
- aucun prompt de permission au chargement de la page.

Variables d'environnement ajoutees :

- `WEB_PUSH_VAPID_PUBLIC_KEY`
- `WEB_PUSH_VAPID_PRIVATE_KEY`
- `WEB_PUSH_VAPID_SUBJECT`

Fichier concerne :

- `backend/.env.production.example`
- `backend/renseignementmedical/settings.py`

## Verification

Commandes executees :

```powershell
cd frontend
npm run lint
npm run build
```

Resultats :

- `npm run lint` : OK, 0 erreur, 12 avertissements existants.
- `npm run build` : OK.
- la route `/offline` est generee comme page statique.

## Test conseille

Pour tester l'installation PWA, utiliser une version production :

```powershell
cd frontend
npm run build
npm run start
```

Puis ouvrir l'application en HTTPS ou sur `localhost`. Sur Android, Chrome peut proposer l'installation. Sur iOS, utiliser Safari puis `Partager` -> `Ajouter a l'ecran d'accueil`.
