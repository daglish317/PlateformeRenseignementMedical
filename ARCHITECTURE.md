# 🏗️ Architecture du Projet SantéProx

## 📋 Vue d'Ensemble

**SantéProx** est une plateforme de recherche et de gestion de structures médicales (hôpitaux, pharmacies) avec géolocalisation.

---

## 🎨 Stack Technique

### Backend - Django REST Framework
- **Framework** : Django 5.x avec Django REST Framework
- **Base de données** : PostgreSQL (production) / SQLite (dev)
- **Authentification** : JWT (Simple JWT)
- **WebSocket** : Django Channels + Redis
- **Stockage fichiers** : FileSystemStorage (local) / S3 (production)

### Frontend - Next.js
- **Framework** : Next.js 15 (App Router)
- **UI** : Tailwind CSS + shadcn/ui
- **Internationalisation** : next-intl (fr/en)
- **État global** : Zustand
- **Requêtes API** : Axios avec intercepteurs JWT
- **PWA** : next-pwa
- **Géolocalisation** : Geolocation API + Leaflet/Mapbox

---

## 📂 Structure du Projet

```
projet-de-stage-L2/
├── backend/                    # Django API
│   ├── renseignementmedical/   # Configuration principale
│   │   ├── settings.py         # Configuration Django
│   │   ├── urls.py             # Routes principales
│   │   └── asgi.py             # Config WebSocket
│   │
│   ├── utilisateurs/           # Gestion utilisateurs
│   │   ├── models.py           # Modèle Utilisateur (Patient, Gestionnaire, Admin)
│   │   ├── views.py            # Auth, profil
│   │   └── decorators.py       # @gestionnaire_required, @admin_required
│   │
│   ├── structures/             # Structures médicales
│   │   ├── models.py           # Structure, Favori, Horaire
│   │   ├── views.py            # CRUD structures, favoris
│   │   ├── form.py             # ⭐ Soumission par gestionnaire
│   │   ├── serializers.py      # Validation données
│   │   └── services.py         # Logique métier
│   │
│   ├── catalogues/             # Catalogue médicaments/matériels
│   ├── stock/                  # Gestion stocks
│   ├── plateau_technique/      # Services médicaux
│   ├── prise_en_charge/        # Gestion prises en charge
│   ├── notifications/          # Système de notifications
│   ├── feedback/               # Avis utilisateurs
│   ├── service_medical/        # Services médicaux
│   └── search/                 # Recherche structures
│
└── frontend/                   # Next.js App
    ├── src/
    │   ├── app/                # Routes (App Router)
    │   │   ├── [locale]/       # Routes i18n
    │   │   │   ├── page.tsx    # Page d'accueil
    │   │   │   ├── admin/      # Dashboard admin
    │   │   │   ├── gestionnaire/ # ⭐ Dashboard gestionnaire
    │   │   │   └── patient/    # Dashboard patient
    │   │   
    │   ├── components/         # Composants réutilisables
    │   │   ├── layout/         # Header, Footer, Logo
    │   │   ├── home/           # Page accueil (carte, recherche)
    │   │   └── ui/             # shadcn/ui components
    │   │
    │   ├── features/           # Features métier
    │   │   ├── auth/           # Authentification
    │   │   │   ├── api/        # authService, tokenService
    │   │   │   ├── store/      # Zustand auth store
    │   │   │   └── components/ # Login, Register
    │   │   │
    │   │   ├── gestionnaire/   # ⭐ Gestionnaire features
    │   │   │   ├── api/        # ⭐ gestionnaireService
    │   │   │   └── components/ # ⭐ StructureSetupForm
    │   │   │
    │   │   ├── admin/          # Admin features
    │   │   └── shared/         # Composants partagés
    │   │
    │   ├── lib/                # Utilitaires
    │   │   ├── axios.ts        # ⭐ Config Axios + intercepteurs JWT
    │   │   └── utils.ts
    │   │
    │   └── i18n/               # Internationalisation
    │
    └── public/
        └── logos/              # ⭐ Logos (LCP)
            ├── logo-horizontal-light.svg
            ├── logo-horizontal-dark.svg
            └── ...
```

---

## 🔐 Système d'Authentification

### Flow JWT
```
1. Login → POST /api/utilisateurs/login/
   ← { access, refresh }

2. Requêtes API → Header: Authorization: Bearer {access}

3. Access expiré (401) → POST /api/utilisateurs/token/refresh/
   ← { access, refresh }

4. Retry requête originale avec nouveau token
```

### Implémentation Frontend
- **Axios intercepteurs** : Ajout automatique du token + refresh sur 401
- **Zustand store** : Gestion état auth + tokens
- **LocalStorage** : Persistance tokens

### Rôles Utilisateurs
- **PATIENT** : Recherche structures, favoris, avis
- **GESTIONNAIRE** : Gère sa structure (horaires, stocks, services)
- **ADMIN** : Valide structures, gère utilisateurs

---

## 🏥 Module Structures (Problème 400)

### Workflow de Création

#### 1. Gestionnaire soumet une structure
```typescript
// Frontend: StructureSetupForm.tsx
gestionnaireService.submitStructure({
  nom: "Hôpital Central",
  type: "HOPITAL",
  adresse: "123 rue...",
  telephone: "0123456789",
  latitude: 48.8566,
  longitude: 2.3522,
  photo: File | null
})
```

#### 2. API Backend valide et crée
```python
# Backend: structures/form.py
@gestionnaire_required  # ⚠️ Vérifie role = GESTIONNAIRE
def post(self, request):
    # Validation
    serializer = StructureCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # Création
    structure = StructureService.creer_structure(
        gestionnaire=request.user,
        donnees=serializer.validated_data
    )
    # Statut = "EN_ATTENTE"
```

#### 3. Admin valide la structure
```python
# Backend: structures/views.py
POST /api/structures/admin/validate/{id}/
{ "action": "APPROVE" | "REJECT", "motif": "..." }
# Statut → "VALIDE" ou "REFUSE"
```

### Validations Backend
- `nom` : min 3 caractères
- `telephone` : min 8 caractères
- `latitude` / `longitude` : obligatoires
- `type` : "HOPITAL" | "PHARMACIE"
- **Rôle** : GESTIONNAIRE obligatoire

---

## 🎨 Module Frontend - Next.js

### Performance (LCP)
**Problème** : Logo détecté comme LCP sans `loading="eager"`

**Solution** : 
```tsx
// components/layout/header/HeaderLogo.tsx
<Logo variant="auto" priority />

// components/layout/Logo.tsx
<Image
  src={logo}
  loading={priority ? "eager" : "lazy"}
  priority={priority}
/>
```

### Géolocalisation
```typescript
// services/map/geolocalisation.ts
getCurrentLocation() → { latitude, longitude }
// Utilisé dans StructureSetupForm pour GPS obligatoire
```

### Internationalisation
- Routes : `/fr/*` et `/en/*`
- Middleware Next.js gère détection locale
- Fichiers de traduction : `messages/fr.json`, `messages/en.json`

---

## 🔄 Flow Complet - Soumission Structure

```
┌─────────────┐
│  Frontend   │
│ (Next.js)   │
└──────┬──────┘
       │ 1. Utilisateur remplit formulaire
       │    + Géolocalisation automatique
       │
       ▼
┌──────────────────────────────────────────┐
│ StructureSetupForm.tsx                   │
│ - Validation côté client                 │
│ - Aperçu photo                           │
└──────┬───────────────────────────────────┘
       │ 2. Submit → gestionnaireService.submitStructure()
       │
       ▼
┌──────────────────────────────────────────┐
│ axios.ts (Interceptor)                   │
│ - Ajoute Header: Bearer {token}          │
│ - Content-Type: multipart/form-data      │
└──────┬───────────────────────────────────┘
       │ 3. POST /api/structures/submit/
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Django)   │
└──────┬──────┘
       │ 4. Middleware JWT vérifie token
       │
       ▼
┌──────────────────────────────────────────┐
│ @gestionnaire_required (decorator)       │
│ - user.is_authenticated?                 │
│ - user.role == "GESTIONNAIRE"?           │
└──────┬───────────────────────────────────┘
       │ 5. Si OK → StructureFormSubmitView.post()
       │
       ▼
┌──────────────────────────────────────────┐
│ StructureCreateSerializer                │
│ - Validation des champs                  │
│ - Validation GPS                         │
└──────┬───────────────────────────────────┘
       │ 6. Si OK → StructureService.creer_structure()
       │
       ▼
┌──────────────────────────────────────────┐
│ Structure créée (statut: EN_ATTENTE)     │
│ - Envoi notification à admin             │
│ - Event WebSocket ?                      │
└──────┬───────────────────────────────────┘
       │ 7. Response 201 avec structure data
       │
       ▼
┌─────────────┐
│  Frontend   │
│  Success!   │
└─────────────┘
```

---

## 🐛 Points de Défaillance (400 Bad Request)

### 1. Authentification ❌
- Token JWT manquant ou invalide
- Token expiré et refresh échoué
- Utilisateur non connecté

### 2. Autorisation ❌
- Utilisateur n'a pas le rôle `GESTIONNAIRE`
- Utilisateur désactivé (`is_active=False`)

### 3. Validation Données ❌
- Nom < 3 caractères
- Téléphone < 8 caractères
- GPS (latitude/longitude) manquant
- Type invalide

### 4. CORS ❌
- Frontend ≠ `http://localhost:3000`
- Backend bloque l'origine

---

## 🔧 Configuration Environnement

### Backend `.env`
```env
DJANGO_ENV=local
SECRET_KEY=...
DEBUG=True

DATABASE_URL=...
REDIS_URL=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

EMAIL_BACKEND=console
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 📊 Modèles Clés

### Utilisateur
```python
class Utilisateur(AbstractBaseUser):
    email = EmailField(unique=True)
    nom = CharField(max_length=100)
    prenom = CharField(max_length=100)
    role = CharField(choices=[
        ("PATIENT", "Patient"),
        ("GESTIONNAIRE", "Gestionnaire"),
        ("ADMIN", "Administrateur")
    ])
    is_active = BooleanField(default=True)
```

### Structure
```python
class Structure(models.Model):
    id = UUIDField(primary_key=True)
    gestionnaire = ForeignKey(Utilisateur)
    nom = CharField(max_length=200)
    type = CharField(choices=[
        ("HOPITAL", "Hôpital"),
        ("PHARMACIE", "Pharmacie")
    ])
    adresse = TextField()
    telephone = CharField(max_length=20)
    latitude = DecimalField()
    longitude = DecimalField()
    photo = ImageField(upload_to="structures/")
    statut = CharField(choices=[
        ("EN_ATTENTE", "En attente"),
        ("VALIDE", "Validé"),
        ("REFUSE", "Refusé")
    ])
```

---

## 🚀 Commandes Utiles

### Backend
```bash
# Lancer serveur
python manage.py runserver

# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell Django
python manage.py shell

# Créer super utilisateur
python manage.py createsuperuser

# Vérifier gestionnaires
python check_user.py
```

### Frontend
```bash
# Lancer dev server
npm run dev

# Build production
npm run build
npm start

# Linter
npm run lint
```

---

## 📚 Ressources

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
