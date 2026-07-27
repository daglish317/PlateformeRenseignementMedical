# 🚨 CORRECTION IMMÉDIATE

## Étape 1 : ARRÊTER le serveur Django
**IMPORTANT : Dans le terminal où Django tourne, appuyez sur `Ctrl+C`**

## Étape 2 : Supprimer la base de données
```bash
cd backend
del db.sqlite3
```

## Étape 3 : Recréer la base
```bash
py manage.py migrate
```

## Étape 4 : Créer un gestionnaire
```bash
py check_user.py
```

## Étape 5 : Redémarrer Django
```bash
py manage.py runserver
```

## Étape 6 : Tester
- Connectez-vous avec `gestionnaire@test.com` / `Gestionnaire123!`
- Soumettez une structure
- ✅ Ça devrait marcher !

---

# 🛡️ PRÉVENIR CE PROBLÈME À L'AVENIR

## 1. Ne jamais supprimer d'utilisateurs ayant validé des structures
```python
# Dans utilisateurs/models.py ou admin
def delete(self, *args, **kwargs):
    if self.structures_validees.exists():
        raise ValueError("Impossible de supprimer un utilisateur ayant validé des structures")
    super().delete(*args, **kwargs)
```

## 2. Utiliser SET_NULL avec protection
Le modèle Structure a déjà `on_delete=models.SET_NULL` pour `valide_par`, donc c'est bon.

## 3. En production, utiliser PostgreSQL
PostgreSQL gère mieux les contraintes d'intégrité que SQLite.

## 4. Faire des sauvegardes régulières
```bash
py manage.py dumpdata > backup.json
```

---

# ⚡ RÉSUMÉ DU PROBLÈME

**Problème initial :** Coordonnées GPS trop précises (trop de décimales)
**Solution :** Augmenté `max_digits` de 9 à 12 et `decimal_places` de 6 à 8

**Problème secondaire :** Contrainte d'intégrité (utilisateur supprimé référencé)
**Solution :** Recréer la base de données (environnement de développement)
