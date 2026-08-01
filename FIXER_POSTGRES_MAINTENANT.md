# 🔧 CORRIGER LES PERMISSIONS POSTGRESQL MAINTENANT

## ⚠️ PROBLÈME
```
psycopg2.errors.InsufficientPrivilege: ERREUR: droit refusé pour le schéma public
```

Votre utilisateur PostgreSQL n'a pas les permissions nécessaires.

---

## ✅ SOLUTION RAPIDE (3 MÉTHODES)

### MÉTHODE 1: Via psql (Recommandé)

**Étape 1: Ouvrir psql**
```bash
# Windows (CMD ou PowerShell)
psql -U postgres

# Si ça ne marche pas, essayez avec le chemin complet:
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
# Ou cherchez où PostgreSQL est installé
```

**Étape 2: Entrer le mot de passe postgres**
(Le mot de passe défini lors de l'installation de PostgreSQL)

**Étape 3: Exécuter les commandes**
```sql
-- Se connecter à votre base
\c recherche_medical

-- Accorder TOUS les droits sur le schéma public
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Permissions futures
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;

-- Quitter
\q
```

**Étape 4: Tester**
```bash
cd backend
py manage.py migrate search
```

---

### MÉTHODE 2: Via fichier SQL

**Étape 1: Ouvrir psql**
```bash
psql -U postgres
```

**Étape 2: Exécuter le script**
```sql
\i backend/fix_postgres_permissions_now.sql
\q
```

**Étape 3: Tester**
```bash
py manage.py migrate search
```

---

### MÉTHODE 3: Avec pgAdmin (Interface graphique)

**Étape 1: Ouvrir pgAdmin**

**Étape 2: Se connecter à votre serveur PostgreSQL**

**Étape 3: Accorder les permissions**
1. Développer **Servers** → Votre serveur → **Databases** → `recherche_medical`
2. Clic droit sur `recherche_medical` → **Query Tool**
3. Copier-coller ce SQL:
```sql
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;
```
4. Cliquer sur **Execute** (F5)

**Étape 4: Tester**
```bash
cd backend
py manage.py migrate search
```

---

## 📋 VÉRIFICATION

Après avoir appliqué une des méthodes ci-dessus:

```bash
cd backend

# Test 1: Migrations
py manage.py migrate search

# Si succès, vous verrez:
# Running migrations:
#   Applying search.0001_initial... OK
#   Applying search.0002_intentpattern_searchindex... OK

# Test 2: Initialiser le moteur
py manage.py init_search

# Test 3: Vérifier
py manage.py shell -c "from search.models import SearchIndex; print(f'✅ Index créé: {SearchIndex.objects.count()} entrées')"
```

---

## ❓ SI ÇA NE MARCHE PAS

### Problème: "psql: command not found"

**Solution:** Ajouter PostgreSQL au PATH ou utiliser le chemin complet:
```bash
# Trouver où est installé PostgreSQL
dir "C:\Program Files\PostgreSQL" /s /b | findstr psql.exe

# Puis utiliser le chemin complet, par exemple:
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### Problème: "password authentication failed"

**Solution:** Utiliser le bon mot de passe postgres
- C'est le mot de passe défini lors de l'installation de PostgreSQL
- Pas le mot de passe Django

### Problème: "database does not exist"

**Solution:** Créer la base d'abord:
```bash
psql -U postgres
```
```sql
CREATE DATABASE recherche_medical;
\q
```

Puis refaire les étapes ci-dessus.

---

## 🎯 ALTERNATIVE: Recréer la Base Proprement

Si vous voulez repartir de zéro avec les bonnes permissions:

```bash
psql -U postgres
```

```sql
-- Supprimer l'ancienne base
DROP DATABASE IF EXISTS recherche_medical;

-- Créer avec PUBLIC owner (tout le monde a accès)
CREATE DATABASE recherche_medical;

-- Accorder tous les droits
GRANT ALL PRIVILEGES ON DATABASE recherche_medical TO PUBLIC;

-- Se connecter à la base
\c recherche_medical

-- Accorder droits sur le schéma
GRANT ALL ON SCHEMA public TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;

\q
```

Puis:
```bash
cd backend
py manage.py migrate
py manage.py init_search
py check_user.py
```

---

## ✅ RÉSULTAT ATTENDU

Après correction, la commande suivante doit fonctionner:

```bash
py manage.py migrate search
```

**Output attendu:**
```
Operations to perform:
  Apply all migrations: search
Running migrations:
  Applying search.0001_initial... OK
  Applying search.0002_intentpattern_searchindex_searchsynonym_and_more... OK
```

---

## 🚀 APRÈS LA CORRECTION

Une fois les permissions corrigées:

```bash
# 1. Migrations
py manage.py migrate

# 2. Initialiser le moteur de recherche
py manage.py init_search

# 3. Créer un utilisateur
py check_user.py

# 4. Démarrer le serveur
py manage.py runserver

# 5. Tester
curl "http://localhost:8000/api/search/unified/?q=test"
```

---

## 💡 CONSEIL

**Pour éviter ce genre de problème à l'avenir:**

1. **En développement:** Utilisez SQLite (plus simple)
   - Commenter `DATABASE_URL` dans `.env`
   - Django utilise automatiquement SQLite

2. **En production:** Utilisez PostgreSQL avec les bonnes permissions
   - Toujours créer la base avec le bon owner
   - Toujours accorder les permissions nécessaires

---

## 📞 BESOIN D'AIDE ?

Si vous avez toujours des problèmes:

1. Partagez votre `DATABASE_URL` (sans le mot de passe)
2. Partagez la version de PostgreSQL: `psql --version`
3. Partagez l'erreur exacte

**Le moteur de recherche est prêt, il ne reste que ce problème de permissions à régler ! 💪**

