# ⚡ PLAN D'ACTION IMMÉDIAT

**Date:** 31 Juillet 2026  
**Objectif:** Rendre le moteur de recherche opérationnel en 10 minutes

---

## 🎯 SITUATION ACTUELLE

### ✅ CE QUI FONCTIONNE
- Code du moteur de recherche 100% implémenté
- Toutes les 17 exigences sont codées
- Migrations créées
- Documentation complète

### ⚠️ CE QUI BLOQUE
- Problème de permissions PostgreSQL
- Les tables ne peuvent pas être créées
- Erreur: "droit refusé pour le schéma public"

---

## 🚀 SOLUTION EN 3 ÉTAPES (10 MINUTES)

### ÉTAPE 1 : Passer à SQLite (2 min)

**Pourquoi SQLite?**
- ✅ Aucune configuration
- ✅ Aucun problème de permissions
- ✅ Parfait pour le développement
- ✅ Migration vers PostgreSQL facile plus tard

**Comment faire:**

```bash
# 1. Ouvrir le fichier .env
cd backend
notepad .env

# 2. Dans .env, commenter ou supprimer DATABASE_URL
# Mettre un # devant ou supprimer cette ligne:
# DATABASE_URL=postgres://...

# 3. Sauvegarder et fermer
```

---

### ÉTAPE 2 : Recréer la Base de Données (3 min)

```bash
# 1. Supprimer l'ancienne base SQLite si elle existe
cd backend
del db.sqlite3

# 2. Créer les tables
py manage.py migrate

# 3. Initialiser le moteur de recherche
py manage.py init_search
```

**Résultat attendu:**
```
Created 10 medical synonyms
Created 9 intent patterns
Reindexing all data...
Indexed 5 entries
✅ Search engine initialized successfully!
```

---

### ÉTAPE 3 : Recréer l'Utilisateur (2 min)

```bash
# Créer un utilisateur gestionnaire
py check_user.py
```

**Credentials:**
- Email: `gestionnaire@test.com`
- Password: `Gestionnaire123!`

---

### ÉTAPE 4 : Tester (3 min)

```bash
# Terminal 1: Démarrer le serveur
py manage.py runserver
```

**Terminal 2: Tester l'API**
```bash
# Test 1: Live search
curl "http://localhost:8000/api/search/live/?q=test"

# Test 2: Recherche complète
curl "http://localhost:8000/api/search/unified/?q=test"

# Test 3: Vérifier l'index
py manage.py shell -c "from search.models import SearchIndex; print(f'Index entries: {SearchIndex.objects.count()}')"
```

**Résultat attendu:** JSON avec résultats ou `[]` si pas de données

---

## ✅ VÉRIFICATIONS FINALES

### 1. Vérifier les migrations
```bash
py manage.py showmigrations search
```

**Doit afficher:**
```
search
 [X] 0001_initial
 [X] 0002_intentpattern_searchindex_searchsynonym_and_more
```

### 2. Vérifier l'index
```bash
py manage.py shell
```
```python
from search.models import SearchIndex, SearchSynonym, IntentPattern

print(f"✅ SearchIndex: {SearchIndex.objects.count()} entries")
print(f"✅ Synonyms: {SearchSynonym.objects.count()} entries")  
print(f"✅ Patterns: {IntentPattern.objects.count()} entries")
```

**Attendu:** Au moins 10 synonyms et 9 patterns

### 3. Tester une recherche
```python
from search.engines.unified_engine import UnifiedSearchEngine

result = UnifiedSearchEngine.search("test")
print(f"✅ Total results: {result['total']}")
print(f"✅ Intent detected: {result['detected_intent']}")
```

---

## 🎨 AJOUTER DES DONNÉES DE TEST

### Option 1: Via l'admin Django

```bash
# 1. Créer un superuser si nécessaire
py manage.py createsuperuser

# 2. Accéder à l'admin
# http://localhost:8000/admin

# 3. Ajouter des structures, stocks, services
```

### Option 2: Via le shell Django

```python
from structures.models import Structure
from stock.models import StockItem

# Créer une structure
structure = Structure.objects.create(
    nom="Pharmacie Test",
    type_structure="PHARMACIE",
    adresse="Yaoundé, Cameroun",
    telephone="+237123456789",
    latitude=3.8480,
    longitude=11.5021,
    statut="ACTIVE"
)

# Créer un stock
stock = StockItem.objects.create(
    structure=structure,
    nom="Paracétamol 500mg",
    type_item="MEDICAMENT",
    quantite=100,
    disponible=True
)

print("✅ Données de test créées!")
```

**L'index sera mis à jour AUTOMATIQUEMENT grâce aux signaux!**

---

## 🧪 TESTS RAPIDES

### Test 1: Recherche simple
```bash
curl "http://localhost:8000/api/search/unified/?q=paracetamol"
```

### Test 2: Live search
```bash
curl "http://localhost:8000/api/search/live/?q=par"
```

### Test 3: Intention conversationnelle
```bash
curl "http://localhost:8000/api/search/unified/?q=ou+trouver+du+paracetamol"
```

### Test 4: Géolocalisation
```bash
curl "http://localhost:8000/api/search/unified/?q=paracetamol&lat=3.8&lon=11.5"
```

---

## 📱 FRONTEND (OPTIONNEL)

### Nettoyer le localStorage

Si vous voulez vous reconnecter au frontend:

```javascript
// Console navigateur (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Puis reconnectez-vous avec:
- Email: `gestionnaire@test.com`
- Password: `Gestionnaire123!`

---

## 🎯 RÉSULTAT ATTENDU

Après ces étapes, vous aurez:

✅ Base de données SQLite fonctionnelle  
✅ Moteur de recherche opérationnel  
✅ Index créé et synchronisé  
✅ Synonymes et patterns chargés  
✅ API accessible et testable  
✅ Admin Django fonctionnel  
✅ Signaux activés pour sync auto  

**Temps total: 10 minutes maximum**

---

## ❓ EN CAS DE PROBLÈME

### Erreur: "No module named 'search'"
```bash
# Vérifier que l'app est installée
py manage.py shell -c "from django.conf import settings; print('search' in settings.INSTALLED_APPS)"

# Si False, ajouter dans settings.py INSTALLED_APPS:
# 'search.apps.SearchConfig',
```

### Erreur: "Table doesn't exist"
```bash
# Recréer les migrations
py manage.py migrate search --fake-initial
py manage.py migrate search
```

### Erreur: "Cannot import UnifiedSearchEngine"
```bash
# Vérifier la structure des fichiers
dir backend\search\engines\
# Doit contenir: __init__.py, unified_engine.py
```

### Pas de résultats dans la recherche
```bash
# Réindexer manuellement
py manage.py init_search
```

---

## 📚 DOCUMENTATION

| Document | Usage |
|----------|-------|
| `ACTION_IMMEDIATE.md` | 👈 **Vous êtes ici** |
| `FIX_POSTGRES_PERMISSIONS.md` | Si vous voulez garder PostgreSQL |
| `ETAT_ACTUEL_PROJET.md` | Vue d'ensemble complète |
| `RESUME_IMPLEMENTATION.md` | Résumé technique |
| `TEST_MOTEUR_RECHERCHE.md` | Guide de test détaillé |
| `INSTRUCTIONS_FINALES.md` | Guide d'utilisation |
| `backend/SEARCH_ENGINE_DOC.md` | Documentation technique |

---

## 🎉 C'EST PARTI !

**Commencez maintenant:**

```bash
cd backend
notepad .env
# Commenter DATABASE_URL
# Sauvegarder

del db.sqlite3
py manage.py migrate
py manage.py init_search
py check_user.py
py manage.py runserver

# Dans un autre terminal:
curl "http://localhost:8000/api/search/unified/?q=test"
```

**Votre moteur de recherche sera opérationnel en 10 minutes ! 🚀**

---

## 💪 PROCHAINES ÉTAPES (APRÈS)

Une fois que ça fonctionne:

1. **Ajouter des données** via l'admin ou imports Excel
2. **Tester toutes les fonctionnalités** (voir `TEST_MOTEUR_RECHERCHE.md`)
3. **Intégrer au frontend** (voir `INSTRUCTIONS_FINALES.md`)
4. **Personnaliser synonymes** et patterns via l'admin
5. **Déployer en production** avec PostgreSQL si nécessaire

**Pour l'instant, concentrez-vous sur les 4 étapes ci-dessus ! ✨**

