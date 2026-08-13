# Performance navigation frontend

## Probleme observe

La navigation entre les pages du dashboard prenait parfois plusieurs secondes en developpement. Au clic sur un lien, Next affichait des messages de type compilation/rendering avant d'afficher la page.

## Causes identifiees

- Le script `npm run dev` forcait `next dev --webpack`.
- Le projet utilise Next 16, dont le serveur de developpement par defaut est plus adapte aux compilations incrementales.
- Les logs montraient aussi un cache Turbopack corrompu dans `.next/dev/cache/turbopack`.
- Plusieurs fichiers `page.tsx` du dashboard etaient marques `"use client"` alors qu'ils ne faisaient que rendre un composant page deja client.
- Les Devtools React Query etaient importes directement dans le provider global en developpement.
- Les routes du menu dashboard n'etaient pas prechauffees explicitement apres chargement du layout.

## Corrections appliquees

- `npm run dev` utilise maintenant `next dev`.
- `npm run dev:webpack` reste disponible si un fallback Webpack est necessaire.
- Ajout du script `npm run clean:next` pour supprimer proprement le cache `.next`.
- Ajout de `onDemandEntries` dans `next.config.ts` pour garder plus de pages compilees en memoire pendant le developpement.
- Chargement dynamique des React Query Devtools, uniquement en developpement.
- Prefetch explicite des routes de sidebar avec `router.prefetch`.
- Suppression de `"use client"` sur les wrappers de routes dashboard qui n'utilisent pas directement de hook React/browser.
- Correction du `manifest.ts` pour respecter le typage Next 16 sur `purpose`.

## Utilisation

Apres cette correction, demarrer le frontend avec :

```powershell
cd frontend
npm run dev
```

Si la navigation reste anormalement lente apres beaucoup de changements de fichiers, nettoyer le cache puis relancer :

```powershell
cd frontend
npm run clean:next
npm run dev
```

## Verification

Commandes executees :

```powershell
cd frontend
npm run lint
npm run clean:next
npm run build
```

Resultats :

- `npm run lint` : OK, 0 erreur, 12 avertissements existants.
- `npm run clean:next` : OK.
- `npm run build` apres nettoyage : OK.

