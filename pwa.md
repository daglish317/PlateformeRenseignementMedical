Implémentation de la PWA (Progressive Web App)
L'ajout d'une PWA permet à vos utilisateurs d'installer l'application SantéProx directement sur l'écran d'accueil de leur téléphone (Android / iOS) ou sur leur ordinateur, comme une vraie application native.

Pour qu'un navigateur (Chrome, Safari, etc.) propose le bouton "Installer", nous devons respecter 3 critères stricts dictés par le web :

Un fichier manifest valide avec des icônes de tailles spécifiques (192x192 et 512x512).
Un Service Worker actif (un script en arrière-plan qui gère le cache et permet le mode hors-ligne).
Une connexion sécurisée (HTTPS ou localhost).
Changements proposés
1. Fichiers modifiés
src/app/manifest.ts :
Mise à jour pour inclure les icônes requises (nous utiliserons votre logo existant /logos/logo-icon.png).
src/app/layout.tsx :
Ajout des balises méta nécessaires pour iOS (apple-touch-icon, theme-color).
Ajout du composant d'enregistrement du Service Worker.
2. Nouveaux fichiers
public/sw.js :
Création du Service Worker natif. Il interceptera les requêtes réseau pour valider les critères PWA des navigateurs.
src/components/pwa/PwaRegister.tsx :
Composant côté client chargé d'inscrire le Service Worker de façon transparente au chargement de l'application.
NOTE

Cette approche est 100% native et n'ajoute aucune dépendance externe (pas de plugins lourds), ce qui garantit que vos performances et votre design resteront intacts.

Plan de vérification
Démarrer le serveur (npm run dev).
Ouvrir les DevTools (onglet "Application" -> "Manifest" et "Service Workers").
Vérifier qu'aucune erreur n'est signalée et que l'option "Installer l'application" s'affiche dans la barre d'adresse du navigateur.