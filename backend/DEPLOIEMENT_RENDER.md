# Guide de deploiement Render.com — RechercheMedical Backend

## Pre-requis

- Compte [Render.com](https://render.com) (gratuit)
- Code pousse sur GitHub (branche `daglish` ou `main`)
- Secrets Google OAuth et Gmail configures

---

## Methode A — Blueprint automatique (recommandee)

### Etape 1 : Pousser le code sur GitHub

```powershell
git push origin daglish
```

### Etape 2 : Creer le Blueprint sur Render

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Clique **New +** → **Blueprint**
3. Connecte ton repo GitHub `PlateformeRenseignementMedical`
4. Render detecte `render.yaml` a la racine
5. Clique **Apply**

Render cree automatiquement :
- **recherche-medical-api** (Web Service Python)
- **recherche-medical-db** (PostgreSQL)

### Etape 3 : Variables d'environnement (Dashboard)

Ouvre le service **recherche-medical-api** → **Environment** → ajoute :

| Variable | Valeur |
|----------|--------|
| `GOOGLE_CLIENT_ID` | ton ID `.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ton secret Google |
| `EMAIL_HOST_USER` | daglish317@gmail.com |
| `EMAIL_HOST_PASSWORD` | mot de passe application Gmail |
| `DEFAULT_FROM_EMAIL` | daglish317@gmail.com |
| `CORS_ALLOWED_ORIGINS` | URL de ton frontend (ex: `https://ton-app.vercel.app`) |

`SECRET_KEY` et `DATABASE_URL` sont generes/lies automatiquement par le Blueprint.

### Etape 4 : Deploy

Render lance le build automatiquement :
- `pip install -r requirements.txt`
- `collectstatic`
- `migrate`

URL finale : `https://recherche-medical-api.onrender.com`

### Etape 5 : Verifier

- Admin Django : `https://recherche-medical-api.onrender.com/admin/`
- API : `https://recherche-medical-api.onrender.com/api/utilisateurs/`

Creer un superuser (Shell Render) :

```bash
python manage.py createsuperuser
```

---

## Methode B — Configuration manuelle

### 1. Base PostgreSQL

**New +** → **PostgreSQL** → nom `recherche-medical-db` → region Frankfurt → Free

### 2. Web Service

**New +** → **Web Service** → connecter le repo

| Champ | Valeur |
|-------|--------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `bash build.sh` |
| Start Command | `daphne -b 0.0.0.0 -p $PORT core.asgi:application` |
| Plan | Free |

### 3. Variables d'environnement

```
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<generer une cle forte>
PYTHON_VERSION=3.12.4
DATABASE_URL=<Internal Database URL depuis PostgreSQL>
EMAIL_USE_SMTP=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ALLOWED_ORIGINS=https://ton-frontend.com
USE_REDIS=false
SECURE_SSL_REDIRECT=False
```

---

## WebSocket (messagerie + notifications)

Sur le plan Free sans Redis, `USE_REDIS=false` utilise la couche **InMemory** (OK pour 1 instance).

Pour la production avec plusieurs instances, decommente Redis dans `render.yaml` et lie `REDIS_URL`.

Connexion WebSocket depuis le frontend :

```
wss://recherche-medical-api.onrender.com/ws/notifications/?token=<JWT>
wss://recherche-medical-api.onrender.com/ws/chat/<conversation_id>/?token=<JWT>
```

---

## Notes importantes

1. **Plan Free** : le service s'endort apres 15 min d'inactivite (cold start ~30s)
2. **Fichiers media** : le disque Render est ephemere — utiliser Cloudinary pour les photos structures (deja dans requirements)
3. **Google OAuth** : ajouter l'URL Render dans les **Authorized JavaScript origins** Google Cloud Console
4. **CORS** : mettre l'URL exacte du frontend dans `CORS_ALLOWED_ORIGINS`

---

## Commandes utiles (Shell Render)

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --no-input
```
