# 🔧 FIX: Problème de Permissions PostgreSQL

## ❌ ERREUR ACTUELLE
```
psycopg2.errors.InsufficientPrivilege: ERREUR: droit refusé pour le schéma public
```

## 🎯 CAUSE
Le user PostgreSQL utilisé par Django n'a pas les permissions pour créer des tables dans le schéma `public`.

---

## ✅ SOLUTION 1 : Utiliser SQLite (RECOMMANDÉ POUR DEV)

### C'est le plus simple et rapide !

**Étape 1 : Modifier `.env`**
```bash
# Commenter ou supprimer DATABASE_URL
# DATABASE_URL=postgres://user:password@host:5432/recherche_medical
```

**Étape 2 : Supprimer le fichier db.sqlite3 s'il existe**
```bash
cd backend
del db.sqlite3
```

**Étape 3 : Recréer la base de données**
```bash
py manage.py migrate
py manage.py init_search
```

**Étape 4 : Recréer l'utilisateur gestionnaire**
```bash
py check_user.py
```

**✅ Terminé !** Votre moteur de recherche est prêt.

---

## ✅ SOLUTION 2 : Fixer PostgreSQL (SI VOUS VOULEZ GARDER POSTGRES)

### Option A : Via psql (ligne de commande PostgreSQL)

**Étape 1 : Se connecter comme superuser**
```bash
psql -U postgres
```

**Étape 2 : Donner les permissions**
```sql
-- Remplacer 'votre_user' par le nom d'utilisateur dans votre DATABASE_URL
GRANT ALL ON SCHEMA public TO votre_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO votre_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO votre_user;

-- Permissions futures
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO votre_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO votre_user;

-- Quitter
\q
```

**Étape 3 : Réessayer les migrations**
```bash
cd backend
py manage.py migrate
py manage.py init_search
```

### Option B : Via pgAdmin (interface graphique)

1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL
3. Clic droit sur la base de données → **Properties**
4. Onglet **Security** → Ajouter votre user
5. Cocher toutes les permissions (CREATE, CONNECT, TEMPORARY, etc.)
6. Sauvegarder
7. Réessayer les migrations

### Option C : Recréer la base avec le bon propriétaire

```bash
psql -U postgres
```

```sql
-- Supprimer l'ancienne base
DROP DATABASE IF EXISTS recherche_medical;

-- Recréer avec le bon owner
CREATE DATABASE recherche_medical OWNER votre_user;

-- Donner les permissions
GRANT ALL ON DATABASE recherche_medical TO votre_user;

-- Se connecter à la base
\c recherche_medical

-- Donner permissions sur le schéma
GRANT ALL ON SCHEMA public TO votre_user;

\q
```

Puis:
```bash
cd backend
py manage.py migrate
py manage.py init_search
```

---

## 🔍 VÉRIFIER LA CONFIGURATION ACTUELLE

**Voir votre DATABASE_URL:**
```bash
cd backend
type .env | findstr DATABASE_URL
```

**Tester la connexion PostgreSQL:**
```bash
py manage.py dbshell
```

Si ça se connecte, tapez:
```sql
\du  -- Voir les users
\l   -- Voir les bases
\q   -- Quitter
```

---

## 📊 APRÈS LA CORRECTION

**Vérifier que tout fonctionne:**

```bash
# 1. Vérifier les migrations
py manage.py showmigrations search

# 2. Vérifier l'index
py manage.py shell -c "from search.models import SearchIndex; print(SearchIndex.objects.count())"

# 3. Tester l'API
curl "http://localhost:8000/api/search/unified/?q=test"
```

---

## 💡 RECOMMANDATION

**Pour le développement local, utilisez SQLite (Solution 1).**  
C'est plus simple, pas de configuration, ça fonctionne directement.

**PostgreSQL est recommandé pour la production uniquement.**

---

## ❓ BESOIN D'AIDE ?

Si les solutions ne fonctionnent pas, partagez:
1. Le contenu de votre `DATABASE_URL` (en cachant le mot de passe)
2. Le résultat de `psql --version`
3. L'erreur exacte que vous obtenez

