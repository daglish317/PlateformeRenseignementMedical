# 🚀 Guide de Résolution Rapide

## 🎯 Résumé des Problèmes

1. ✅ **Logo LCP** - Déjà configuré correctement, redémarrez Next.js
2. 🔍 **400 Bad Request** - Probablement un problème d'authentification/rôle

---

## ⚡ Actions Rapides

### 1. Vérifier et créer un gestionnaire

```bash
cd backend
python check_user.py
```

Ce script va :
- ✅ Lister tous les gestionnaires existants
- ✅ Créer automatiquement un gestionnaire de test si aucun n'existe
- ✅ Afficher les identifiants à utiliser

**Identifiants du gestionnaire créé :**
- 📧 Email : `gestionnaire@test.com`
- 🔑 Mot de passe : `Gestionnaire123!`

---

### 2. Redémarrer les serveurs avec les logs

#### Terminal 1 - Backend Django
```bash
cd backend
python manage.py runserver
```

#### Terminal 2 - Frontend Next.js
```bash
cd frontend
npm run dev
```

---

### 3. Tester la soumission de structure

1. **Connectez-vous** avec les identifiants du gestionnaire
2. **Accédez** à la page de soumission de structure
3. **Remplissez** le formulaire et soumettez
4. **Observez** les logs dans les deux terminaux

#### Logs Frontend (Console navigateur F12)
Vous verrez :
```
📤 Submitting structure: { nom, type, adresse, ... }
```

En cas d'erreur :
```
❌ Error submitting structure: { status: 400, data: {...} }
```

#### Logs Backend (Terminal)
Vous verrez :
```
📥 Received structure submission request
User: gestionnaire@test.com
Role: GESTIONNAIRE
Data: { nom, type, adresse, ... }
```

En cas d'erreur :
```
❌ Validation errors: { ... }
```

---

## 🔧 Solutions Courantes

### Problème : "Non authentifié" ou "Accès refusé"

**Solution :** Se reconnecter
1. Déconnectez-vous du frontend
2. Reconnectez-vous avec `gestionnaire@test.com` / `Gestionnaire123!`
3. Réessayez

### Problème : Token expiré

**Solution :** Forcer la reconnexion
```javascript
// Dans la console du navigateur (F12)
localStorage.clear();
// Puis rechargez la page et reconnectez-vous
```

### Problème : CORS

**Vérifiez** que vous accédez bien au frontend via `http://localhost:3000` (pas `127.0.0.1`)

---

## 📋 Checklist de Débogage

- [ ] Un utilisateur avec le rôle `GESTIONNAIRE` existe
- [ ] Vous êtes connecté avec cet utilisateur sur le frontend
- [ ] Le token JWT est présent dans localStorage
- [ ] Le backend tourne sur `http://localhost:8000`
- [ ] Le frontend tourne sur `http://localhost:3000`
- [ ] Les deux serveurs affichent des logs lors de la soumission

---

## 📞 Besoin d'Aide ?

Si le problème persiste après ces étapes, partagez :

1. **Les logs complets du backend** (terminal Django)
2. **Les logs de la console navigateur** (F12 → Console)
3. **La réponse HTTP complète** :
   ```javascript
   // Dans Console (F12) → Network → Sélectionner la requête submit
   // Copier : Response Status, Response Headers, Response Body
   ```

---

## 📚 Documentation Complète

Voir `DEBUG-ISSUES.md` pour une analyse détaillée et des solutions avancées.
