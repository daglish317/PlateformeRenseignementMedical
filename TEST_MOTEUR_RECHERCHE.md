# 🧪 GUIDE DE TEST - Moteur de Recherche Intelligent

## 🎯 Comment tester le moteur de recherche

---

## ✅ PRÉREQUIS

1. **Backend Django en cours d'exécution**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Base de données initialisée**
   ```bash
   python manage.py migrate
   python manage.py init_search
   ```

3. **Avoir des données de test**
   - Au moins une structure (hôpital ou pharmacie)
   - Quelques stocks (médicaments)
   - Quelques services médicaux

---

## 🔬 TESTS MANUELS RAPIDES

### Test 1 : Live Search (Autocomplétion)

**Dans votre navigateur ou avec curl :**
```bash
http://localhost:8000/api/search/live/?q=par
```

**Résultat attendu :**
```json
{
  "query": "par",
  "suggestions": [
    {
      "text": "Paracétamol",
      "type": "MEDICAMENT"
    }
  ]
}
```

**✅ Succès si :** Vous obtenez des suggestions même avec seulement 2-3 lettres

---

### Test 2 : Recherche Simple

```bash
http://localhost:8000/api/search/unified/?q=paracetamol
```

**Résultat attendu :**
```json
{
  "results": [
    {
      "id": "...",
      "content": "Paracétamol 500mg",
      "type": "MEDICAMENT",
      "structure": {...},
      "distance_km": null,
      "is_available": true,
      "quantity": 50,
      "relevance_score": 95.5
    }
  ],
  "total": 1,
  "query": "paracetamol",
  "detected_intent": "medication"
}
```

**✅ Succès si :**
- Vous obtenez des résultats
- `detected_intent` est cohérent
- Les structures sont complètes

---

### Test 3 : Recherche Géolocalisée

```bash
http://localhost:8000/api/search/unified/?q=paracetamol&lat=3.8480&lon=11.5021
```

**✅ Succès si :**
- `distance_km` est calculé
- Résultats triés par distance
- Les plus proches en premier

---

### Test 4 : Tolérance aux Fautes

**Test avec faute :**
```bash
http://localhost:8000/api/search/unified/?q=paracetammol
# (avec 2 "m")
```

**✅ Succès si :** Trouve quand même "Paracétamol" (avec 1 "m")

---

### Test 5 : Recherche Conversationnelle

**Test 1 : Intention médicament**
```bash
http://localhost:8000/api/search/unified/?q=ou+trouver+du+paracetamol
```

**✅ Succès si :** `detected_intent` = "MEDICAMENT"

**Test 2 : Intention symptôme**
```bash
http://localhost:8000/api/search/unified/?q=j\'ai+mal+a+la+tete
```

**✅ Succès si :** `detected_intent` = "symptom" ou "MALADIE"

**Test 3 : Intention urgence**
```bash
http://localhost:8000/api/search/unified/?q=fracture
```

**✅ Succès si :** `detected_intent` = "EMERGENCY"

---

### Test 6 : Recherche Multi-Mots

```bash
http://localhost:8000/api/search/unified/?q=paracetamol+yaounde
```

**✅ Succès si :**
- Parse correctement le terme ET la localisation
- `parsed.location` = "yaounde"
- `parsed.term` = "paracetamol"

---

### Test 7 : Historique Utilisateur

**Prérequis :** Être authentifié

```bash
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://localhost:8000/api/search/history/
```

**✅ Succès si :** Retourne vos dernières recherches

---

## 🎨 TEST DEPUIS L'INTERFACE ADMIN

### 1. Accédez à l'admin
```
http://localhost:8000/admin/search/
```

### 2. Vérifiez SearchIndex
- Cliquez sur "Search indexs"
- Vérifiez qu'il y a des entrées
- Vérifiez que `content` est normalisé (minuscules, sans accents)

### 3. Vérifiez SearchLog
- Cliquez sur "Search logs"
- Effectuez des recherches
- Vérifiez qu'elles apparaissent ici

### 4. Testez les Synonymes
- Cliquez sur "Search synonyms"
- Cliquez sur "Paracétamol"
- Vérifiez les synonymes : ["acetaminophene", "doliprane", ...]

### 5. Testez les Patterns
- Cliquez sur "Intent patterns"
- Vérifiez les patterns comme "j'ai mal", "où trouver", etc.

---

## 🐍 TEST DEPUIS LE SHELL DJANGO

```bash
python manage.py shell
```

### Test 1 : Vérifier l'index
```python
from search.models import SearchIndex

# Compter les entrées
print(f"Total entrées: {SearchIndex.objects.count()}")

# Par type
print(f"Médicaments: {SearchIndex.objects.filter(search_type='MEDICAMENT').count()}")
print(f"Services: {SearchIndex.objects.filter(search_type='SERVICE_MEDICAL').count()}")

# Afficher quelques entrées
for item in SearchIndex.objects.all()[:5]:
    print(f"{item.search_type}: {item.content_original}")
```

### Test 2 : Tester la recherche
```python
from search.engines.unified_engine import UnifiedSearchEngine

# Recherche simple
result = UnifiedSearchEngine.search("paracetamol")
print(f"Total résultats: {result['total']}")
print(f"Intention détectée: {result['detected_intent']}")

# Recherche géolocalisée
result = UnifiedSearchEngine.search(
    "paracetamol",
    user_lat=3.8480,
    user_lon=11.5021
)
print(f"Distance premier résultat: {result['results'][0]['distance_km'] if result['results'] else 'N/A'}")
```

### Test 3 : Tester la normalisation
```python
from search.indexer import SearchIndexer

# Test normalisation
print(SearchIndexer.normalize_text("Paracétamol"))
# Doit afficher: "paracetamol" (minuscules, sans accent)

print(SearchIndexer.normalize_text("J'ai mal à la tête !"))
# Doit afficher: "j ai mal a la tete" (normalisé)
```

### Test 4 : Tester la détection d'intention
```python
from search.engines.unified_engine import UnifiedSearchEngine

# Test différentes requêtes
queries = [
    "paracetamol",
    "où trouver du paracetamol",
    "j'ai mal à la tête",
    "fracture",
    "cardiologue",
]

for q in queries:
    intent = UnifiedSearchEngine.detect_intent(q)
    print(f"'{q}' → {intent}")
```

---

## 📊 TEST DE PERFORMANCE

### Test 1 : Temps de réponse
```python
import time
from search.engines.unified_engine import UnifiedSearchEngine

start = time.time()
result = UnifiedSearchEngine.search("paracetamol")
end = time.time()

print(f"Temps de recherche: {(end - start) * 1000:.2f}ms")
print(f"Résultats: {result['total']}")
```

**✅ Succès si :** < 200ms

### Test 2 : Live search
```python
import time

start = time.time()
suggestions = UnifiedSearchEngine.live_search("par")
end = time.time()

print(f"Temps live search: {(end - start) * 1000:.2f}ms")
print(f"Suggestions: {len(suggestions)}")
```

**✅ Succès si :** < 50ms

---

## 🔄 TEST DE SYNCHRONISATION AUTOMATIQUE

### Test : L'index se met à jour automatiquement

```python
from stock.models import StockItem
from structures.models import Structure
from search.models import SearchIndex

# 1. Compter les entrées actuelles
count_before = SearchIndex.objects.count()
print(f"Entrées avant: {count_before}")

# 2. Créer un nouveau stock
structure = Structure.objects.first()
stock = StockItem.objects.create(
    structure=structure,
    nom="Test Médicament Automatique",
    type_item="MEDICAMENT",
    quantite=100,
    disponible=True
)

# 3. Vérifier que l'index a été mis à jour AUTOMATIQUEMENT
count_after = SearchIndex.objects.count()
print(f"Entrées après: {count_after}")

# 4. Vérifier que le nouveau stock est indexé
indexed = SearchIndex.objects.filter(
    content_type="stock",
    object_id=stock.id
).exists()
print(f"Nouveau stock indexé: {indexed}")

# 5. Vérifier qu'on peut le trouver
result = UnifiedSearchEngine.search("Test Medicament Automatique")
print(f"Trouvé dans la recherche: {result['total'] > 0}")

# Nettoyage
stock.delete()
```

**✅ Succès si :** Toutes les vérifications passent

---

## 🎯 CHECKLIST DE TEST COMPLÈTE

### Tests Fonctionnels
- [ ] Live search fonctionne (< 50ms)
- [ ] Recherche simple retourne des résultats
- [ ] Recherche géolocalisée calcule les distances
- [ ] Tolérance aux fautes fonctionne
- [ ] Détection d'intention fonctionne
- [ ] Recherche multi-mots parse correctement
- [ ] Historique s'enregistre automatiquement
- [ ] Synonymes sont pris en compte
- [ ] Patterns d'intention fonctionnent

### Tests Techniques
- [ ] Index se synchronise automatiquement
- [ ] Normalisation fonctionne correctement
- [ ] Scoring calcule correctement
- [ ] Pagination fonctionne
- [ ] Cache fonctionne (deuxième requête plus rapide)

### Tests Performance
- [ ] Live search < 50ms
- [ ] Recherche complète < 200ms
- [ ] Index synchronisé en < 100ms après création

### Tests Admin
- [ ] SearchIndex visible et correct
- [ ] SearchLog enregistre les recherches
- [ ] SearchSynonym modifiable
- [ ] IntentPattern modifiable

---

## 🐛 DÉBOGAGE

### Problème : Aucun résultat
```python
# Vérifier l'index
from search.models import SearchIndex
print(f"Entrées dans l'index: {SearchIndex.objects.count()}")

# Si 0, réindexer
from search.indexer import SearchIndexer
SearchIndexer.reindex_all()
```

### Problème : Recherche lente
```python
# Vérifier le cache
from django.core.cache import cache
cache.clear()  # Vider et retester
```

### Problème : Intention mal détectée
```python
# Vérifier les patterns
from search.models import IntentPattern
for p in IntentPattern.objects.filter(is_active=True):
    print(f"{p.pattern} → {p.intent_type}")

# Ajouter un nouveau pattern si nécessaire
```

---

## ✅ RÉSULTAT ATTENDU

Après tous ces tests, vous devriez :

✅ Obtenir des résultats pertinents  
✅ Voir la détection d'intention fonctionner  
✅ Constater la tolérance aux fautes  
✅ Observer la synchronisation automatique  
✅ Mesurer des performances < 200ms  
✅ Voir l'historique s'enregistrer  
✅ Constater le tri par pertinence + distance  

---

## 🎉 SI TOUS LES TESTS PASSENT

**Le moteur de recherche est 100% opérationnel !**

Vous pouvez :
- L'utiliser en production
- L'intégrer au frontend
- Le présenter aux utilisateurs

**Félicitations ! 🚀**
