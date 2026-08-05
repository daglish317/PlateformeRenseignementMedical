# Rapport d'Audit de Sécurité — Projet Projet de Stage L2
**Date** : 04/08/2026  
**Scope** : Frontend (Next.js 16), Backend (Django 6), Infrastructure

---

## Résumé Exécutif

| Sévérité | Nombre |
|----------|--------|
| Critique | 6      |
| Élevé    | 8      |
| Moyen    | 6      |
| Faible   | 5      |

**Risque global** : **ÉLEVÉ** — Des failles critiques non corrigées permettent la création non autorisée d'administrateurs, l'exposition de secrets, et l'injection SQL.

---

## 1. CRITIQUE

### 1.1 — `RegisterAdminView` accessible sans authentification

**Fichier** : `backend/utilisateurs/views_admin.py`  
**Description** : Le endpoint `POST /api/utilisateurs/admin/create/` n'exige aucune authentification. N'importe qui peut créer un compte administrateur.  
**Impact** : Prise de contrôle totale de l'application.  
**Remédiation** :
```python
permission_classes = [IsAuthenticated, IsAdminUser]
```

---

### 1.2 — `DEFAULT_PERMISSION_CLASSES = [AllowAny]`

**Fichier** : `backend/renseignementmedical/settings.py`  
**Description** : La permission par défaut du backend est `AllowAny`. Tous les endpoints non protégés explicitement sont ouverts.  
**Impact** : Accès non autorisé à toutes les données.  
**Remédiation** :
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

### 1.3 — Tokens JWT stockés dans `localStorage`

**Fichier** : `src/features/auth/utils/auth-storage.ts`  
**Description** : Les tokens d'accès et de rafraîchissement sont stockés dans `localStorage`, vulnérable aux attaques XSS.  
**Impact** : Vol de session via injection de script.  
**Remédiation** : Utiliser des cookies `httpOnly`, `secure`, `SameSite=Strict` gérés par le serveur.

---

### 1.4 — Open Redirect via paramètre `returnTo`

**Fichier** : `src/features/auth/hooks/useAuthRedirect.ts`  
**Description** : Le paramètre `returnTo` de l'URL est utilisé sans validation pour rediriger l'utilisateur après connexion.  
**Impact** : Un attaquant peut rediriger vers un site malveillant.  
**Remédiation** : Valider que `returnTo` est un chemin relatif commençant par `/`.

---

### 1.5 — Injection SQL dans `query_optimizer.py`

**Fichier** : `backend/core/db/query_optimizer.py:197`  
**Description** : Construction de requête SQL via f-string avec entrée utilisateur.  
**Impact** : Exécution de requêtes SQL arbitraires.  
**Remédiation** : Utiliser des requêtes paramétrées (`cursor.execute(query, [params])`).

---

### 1.6 — Variables d'environnement (`backend/.env`) versionnées

**Fichier** : `backend/.env`  
**Description** : Le fichier `.env` contenant les secrets (clés de base de données, JWT secret, API keys) est présent dans le dépôt Git.  
**Impact** : Exposition de toutes les secrets du backend.  
**Remédiation** : Ajouter `.env` au `.gitignore`, le supprimer de l'historique Git, et utiliser un gestionnaire de secrets.

---

## 2. ÉLEVÉ

### 2.1 — Open Redirect (détail)

**Fichier** : `src/features/auth/hooks/useAuthRedirect.ts`  
**Description** : Le paramètre `returnTo` n'est pas validé, permettant la redirection vers des domaines externes.

---

### 2.2 — CORS `Access-Control-Allow-Origin: *`

**Fichier** : `frontend/next.config.ts`, `backend/renseignementmedical/settings.py`  
**Description** : Le backend autorise toutes les origines.  
**Impact** : N'importe quel site peut faire des requêtes API authentifiées.  
**Remédiation** : Restreindre aux origines spécifiques.

---

### 2.3 — Content Security Policy (CSP) trop permissive

**Fichier** : `frontend/next.config.ts`  
**Description** : `script-src 'unsafe-inline' 'unsafe-eval'` autorise l'exécution de scripts arbitraires.  
**Impact** : XSS plus facile.  
**Remédiation** : Supprimer `unsafe-inline` et `unsafe-eval`, utiliser des nonces.

---

### 2.4 — Cross-Origin-Opener-Policy (COOP) et Google GSI

**Fichier** : `frontend/next.config.ts`  
**Description** : Les headers COOP (`same-origin-allow-popups`) sur `/fr/connexion` génèrent des warnings GSI.  
**Impact** : Comportement imprévisible du popup Google.

---

### 2.5 — IDOR sur favoris et horaires

**Fichiers** : Endpoints favoris et horaires  
**Description** : Pas de vérification que l'utilisateur authentifié est propriétaire des ressources accédées.  
**Impact** : Modification/suppression de données d'autres utilisateurs.

---

### 2.6 — CSRF non protégé côté backend

**Fichier** : `backend/renseignementmedical/settings.py`  
**Description** : Pas de middleware CSRF ou de protection `CSRF_COOKIE_SECURE`.  
**Impact** : Attaques CSRF sur les endpoints state-changing.

---

### 2.7 — Upload sans validation stricte

**Fichiers** : Endpoints d'upload  
**Description** : Validation insuffisante des types et tailles de fichiers uploadés.  
**Impact** : Upload de fichiers malveillants.

---

### 2.8 — Version Django / dépendances obsolètes

**Fichier** : `backend/requirements.txt`  
**Description** : Dépendances potentiellement obsolètes avec des CVE connues.  
**Remédiation** : `pip audit` et mise à jour.

---

## 3. MOYEN

### 3.1 — XSS via popups Leaflet

**Fichiers** : Composants carte  
**Description** : Les popups Leaflet utilisent `innerHTML` avec du contenu non échappé.  
**Remédiation** : Utiliser `textContent` ou échapper le HTML.

---

### 3.2 — Clickjacking

**Fichier** : `frontend/next.config.ts`  
**Description** : Pas de header `X-Frame-Options` ou `frame-ancestors` CSP.  
**Remédiation** : Ajouter `X-Frame-Options: DENY`.

---

### 3.3 — Source maps exposées en production

**Fichier** : `frontend/next.config.ts`  
**Description** : Les source maps peuvent être accessibles en production.  
**Remédiation** : Désactiver `productionBrowserSourceMaps`.

---

### 3.4 — Logs sensibles potentiellement exposés

**Fichiers** : Backend logs  
**Description** : Les tokens et secrets peuvent apparaître dans les logs.  
**Remédiation** : Masquer les données sensibles dans le logging.

---

### 3.5 — Pas de rate limiting

**Fichiers** : Tous les endpoints API  
**Description** : Pas de protection contre les attaques par force brute.  
**Remédiation** : Implémenter un rate limiter (ex: `django-ratelimit`).

---

### 3.6 — JWT sans rotation de refresh token

**Fichiers** : Backend auth  
**Description** : Les refresh tokens ne sont pas rotés après utilisation.  
**Remédiation** : Implémenter la rotation des refresh tokens.

---

## 4. FAIBLE

### 4.1 — Headers de sécurité manquants

**Fichiers** : Frontend + Backend  
**Description** : `Strict-Transport-Security`, `X-Content-Type-Options` manquants.  
**Remédiation** : Ajouter ces headers.

---

### 4.2 — Cookie de session non sécurisé

**Fichiers** : Backend config  
**Description** : `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY` non configurés.  
**Remédiation** : Activer ces options.

---

### 4.3 — Debug mode potentiellement activé en production

**Fichier** : `backend/renseignementmedical/settings.py`  
**Description** : `DEBUG` doit être `False` en production.  
**Vérification** : S'assurer que la variable d'environnement le désactive.

---

### 4.4 — Exposition d'informations dans les erreurs

**Fichiers** : Backend  
**Description** : Les messages d'erreur détaillés peuvent révéler l'architecture.  
**Remédiation** : Masquer les détails en production.

---

### 4.5 — `.gitignore` incomplet

**Fichiers** : `.gitignore`  
**Description** : Certains fichiers sensibles ne sont pas exclus.  
**Remédiation** : Mettre à jour `.gitignore`.

---

## Actions Prioritaires

1. **Immédiat** : `RegisterAdminView` → `IsAuthenticated` + `IsAdminUser`
2. **Immédiat** : `AllowAny` → `IsAuthenticated` par défaut
3. **Immédiat** : Supprimer `.env` de Git, ajouter au `.gitignore`
4. **Court terme** : Fix injection SQL dans `query_optimizer.py`
5. **Court terme** : Cookies httpOnly pour JWT
6. **Court terme** : Validation `returnTo` dans le redirect
7. **Moyen terme** : CSP, CORS, CSRF, rate limiting
8. **Long terme** : Rotation tokens, dépendances, monitoring
