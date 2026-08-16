# Instructions Nettoyage Cache

## 🔴 Problème
Les modifications ne sont pas visibles car le cache empêche le rechargement.

---

## ✅ Solution Complète

### Étape 1 : Arrêter TOUS les Serveurs
1. Arrêter le serveur **backend** (Ctrl+C dans terminal backend)
2. Arrêter le serveur **frontend** (Ctrl+C dans terminal frontend)
3. Fermer tous les terminaux

### Étape 2 : Exécuter le Script de Nettoyage
1. Double-cliquer sur : **`NETTOYER_CACHE.bat`**
2. Le script va :
   - Tuer tous les processus Node.js
   - Supprimer `__pycache__` (Python)
   - Supprimer `.next` (Next.js)
   - Supprimer `node_modules\.cache`

### Étape 3 : Vider Cache Navigateur
**TRÈS IMPORTANT !**

#### Chrome / Edge
1. Appuyer sur **Ctrl + Shift + Delete**
2. Période : **Toutes les périodes**
3. Cocher :
   - ☑ **Cookies et autres données de sites**
   - ☑ **Images et fichiers en cache**
4. Cliquer **Effacer les données**

#### Firefox
1. Appuyer sur **Ctrl + Shift + Delete**
2. Période : **Tout**
3. Cocher :
   - ☑ **Cookies**
   - ☑ **Cache**
4. Cliquer **OK**

### Étape 4 : Redémarrer Backend
```bash
cd backend
py manage.py runserver
```
Attendre message : `Starting development server at http://127.0.0.1:8000/`

### Étape 5 : Redémarrer Frontend (Nouveau Terminal)
```bash
cd frontend
npm run dev
```
Attendre message : `✓ Ready in X.Xs`

### Étape 6 : Tester dans Navigateur
1. Ouvrir : **http://localhost:3000**
2. **Forcer actualisation complète** : **Ctrl + Shift + R** (ou Ctrl + F5)
3. Se **déconnecter** complètement
4. Se **reconnecter**

---

## 🧪 Vérification Owner Sidebar

Une fois reconnecté en tant que **PROPRIETAIRE** :

### Sidebar doit contenir 19 items :
```
✅ Dashboard
✅ Structures & Équipe

--- Pharmacie ---
✅ Stock
✅ Médicaments
✅ Vente
✅ Caisse
✅ Approvisionnement
✅ Inventaire
✅ Péremption
✅ Historique
✅ Alertes
✅ Statistiques
✅ Horaires           ← NOUVEAU
✅ Notifications      ← NOUVEAU

--- Hôpital ---
✅ Services Médicaux  ← NOUVEAU
✅ Plateaux Techniques ← NOUVEAU
✅ Prises en Charge   ← NOUVEAU

--- Exclusif ---
✅ Messagerie

--- Toujours ---
✅ Profil
✅ Paramètres
```

---

## ❌ Si Toujours Pas Visible

### Option A : Vérifier Fichiers Source
1. Ouvrir : `frontend/src/features/shared/dashboard/navigation/owner-navigation.ts`
2. Chercher : `Horaires`, `Notifications`, `Services Médicaux`
3. Si absents → Les fichiers n'ont pas été modifiés

### Option B : React DevTools
1. Installer extension "React Developer Tools"
2. Ouvrir DevTools → React
3. Chercher composant `DashboardSidebar`
4. Vérifier prop `navigation` → doit contenir 19 items

### Option C : Console Logs
1. Ouvrir DevTools (F12) → Console
2. Taper :
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload(true)
   ```

### Option D : Mode Incognito
1. Ouvrir fenêtre navigation privée / incognito
2. Aller sur http://localhost:3000
3. Se connecter
4. Vérifier sidebar

---

## 📞 Debug Avancé

Si AUCUNE solution ne fonctionne, dans console navigateur :

```javascript
// Vérifier que les fichiers sont bien chargés
console.log(window.performance.getEntriesByType('resource').filter(r => 
  r.name.includes('owner-navigation')
))
```

Ensuite me fournir :
1. Screenshot de la sidebar
2. Contenu de la console
3. Résultat de la commande ci-dessus

---

## ✅ Checklist Complète

- [ ] Backend arrêté
- [ ] Frontend arrêté
- [ ] Script `NETTOYER_CACHE.bat` exécuté
- [ ] Cache navigateur vidé (Ctrl+Shift+Delete)
- [ ] Backend redémarré
- [ ] Frontend redémarré
- [ ] Page actualisée (Ctrl+Shift+R)
- [ ] Déconnexion/Reconnexion
- [ ] Sidebar vérifiée

---

**Si après TOUTES ces étapes les modules ne sont pas visibles, il y a un problème avec les fichiers source eux-mêmes.**
