# 🔧 Résolution des Problèmes - Backend/Frontend

## ✅ Problème 1 : Logo LCP (Largest Contentful Paint) - RÉSOLU

### Diagnostic
Le logo `/logos/logo-horizontal-light.svg` était détecté comme l'élément LCP mais Next.js recommandait d'ajouter `loading="eager"`.

### Solution Implémentée
Le composant `HeaderLogo.tsx` utilise déjà la prop `priority={true}` qui ajoute automatiquement `loading="eager"` dans le composant `Logo.tsx` :

```tsx
// frontend/src/components/layout/header/HeaderLogo.tsx
<Logo variant="auto" priority />
```

Le composant `Logo` gère correctement cette prop :
```tsx
loading={priority ? "eager" : "lazy"}
```

### Action Requise
**Redémarrez le serveur de développement Next.js** pour que les changements prennent effet :
```bash
cd frontend
npm run dev
```

L'avertissement LCP devrait disparaître.

---

## 🔍 Problème 2 : 400 Bad Request sur `/api/structures/submit/`

### Diagnostic
Le frontend appelle `POST http://localhost:8000/api/structures/submit/` mais reçoit une erreur 400.

### Causes Possibles

#### 1. **Problème d'authentification/autorisation** (Le plus probable)
- Le décorateur `@gestionnaire_required` vérifie que :
  - L'utilisateur est authentifié
  - L'utilisateur a le rôle `GESTIONNAIRE` (pas `ADMIN` ou `PATIENT`)

#### 2. **Validation des données**
Le backend valide :
- `nom` : minimum 3 caractères
- `telephone` : minimum 8 caractères  
- `latitude` et `longitude` : obligatoires et non vides
- `type` : doit être "HOPITAL" ou "PHARMACIE"

#### 3. **Token JWT invalide/expiré**
- Le token est peut-être expiré
- Le token n'est pas envoyé correctement

### Logs Ajoutés

#### Backend (`backend/structures/form.py`)
```python
print("📥 Received structure submission request")
print(f"User: {request.user.email if request.user.is_authenticated else 'Anonymous'}")
print(f"Role: {request.user.role if request.user.is_authenticated else 'N/A'}")
print(f"Data: {request.data}")
print(f"❌ Validation errors: {serializer.errors}")  # Si validation échoue
```

#### Frontend (`frontend/src/features/gestionnaire/api/gestionnaire.service.ts`)
```typescript
console.log("📤 Submitting structure:", { ... });
console.error("❌ Error submitting structure:", { status, data, message });
```

### Comment Déboguer

1. **Ouvrez la console du navigateur** (F12)
2. **Essayez de soumettre une structure**
3. **Vérifiez les logs** :
   - Console navigateur : payload envoyé et erreur reçue
   - Terminal backend : détails de la requête et erreurs de validation

4. **Vérifications à faire** :

#### A. Vérifier l'authentification
```bash
# Dans la console navigateur
localStorage.getItem('access_token')  # Doit retourner un token
```

#### B. Vérifier le rôle de l'utilisateur
Connectez-vous au backend Django :
```bash
cd backend
python manage.py shell
```

```python
from utilisateurs.models import Utilisateur
user = Utilisateur.objects.get(email="votre-email@example.com")
print(f"Role: {user.role}")  # Doit être "GESTIONNAIRE"
```

Si le rôle n'est pas correct, modifiez-le :
```python
user.role = "GESTIONNAIRE"
user.save()
```

#### C. Vérifier le token JWT
Dans la console du navigateur :
```javascript
// Décoder le token (sans vérifier la signature)
const token = localStorage.getItem('access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Token expires at:', new Date(payload.exp * 1000));
}
```

#### D. Tester l'endpoint directement
Utilisez curl ou Postman pour tester :
```bash
curl -X POST http://localhost:8000/api/structures/submit/ \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "nom=Hopital Test" \
  -F "type=HOPITAL" \
  -F "adresse=123 rue Test" \
  -F "telephone=0123456789" \
  -F "latitude=48.8566" \
  -F "longitude=2.3522"
```

### Solutions Courantes

#### Solution 1 : Créer un utilisateur GESTIONNAIRE
```bash
cd backend
python manage.py shell
```

```python
from utilisateurs.models import Utilisateur

# Créer un gestionnaire
user = Utilisateur.objects.create_user(
    email="gestionnaire@test.com",
    password="Test1234!",
    nom="Gestionnaire",
    prenom="Test",
    role="GESTIONNAIRE"
)
user.save()
print(f"Gestionnaire créé : {user.email} - Role: {user.role}")
```

#### Solution 2 : Se reconnecter
Si votre utilisateur existe mais le token est expiré :
1. Déconnectez-vous du frontend
2. Reconnectez-vous avec les identifiants du gestionnaire
3. Réessayez de soumettre la structure

#### Solution 3 : Vérifier CORS
Dans `backend/renseignementmedical/settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

Assurez-vous que votre frontend tourne sur `http://localhost:3000`.

---

## 📊 Prochaines Étapes

1. **Redémarrez les serveurs** :
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Testez la soumission** et **regardez les logs** dans :
   - Console navigateur (F12)
   - Terminal backend (Python)

3. **Partagez les logs** si le problème persiste, en particulier :
   - L'erreur complète du frontend
   - Les logs du backend
   - Le statut HTTP exact et le body de la réponse

---

## 📝 Configuration Actuelle

### Backend
- URL : `http://localhost:8000`
- Endpoint : `/api/structures/submit/`
- Méthode : POST (multipart/form-data)
- Authentification : JWT Bearer Token
- Rôle requis : `GESTIONNAIRE`

### Frontend
- URL : `http://localhost:3000`
- API Base : `http://localhost:8000/api` (depuis `.env.local`)
- Axios avec intercepteurs JWT automatiques

---

## ✨ Fichiers Modifiés

1. ✅ `frontend/src/features/gestionnaire/api/gestionnaire.service.ts` - Ajout de logs
2. ✅ `backend/structures/form.py` - Ajout de logs détaillés

Les logs vous permettront d'identifier précisément où le problème se situe.
