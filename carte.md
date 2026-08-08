Agis en tant qu'Architecte Logiciel Senior et Expert en Recherche d'Information (Information Retrieval) et Bases de Données. Je souhaite concevoir et implémenter un moteur de recherche intelligent, unifié et ultra-rapide pour une application médicale géolocalisée (type "Google Maps de la santé"). 

Le moteur ne doit utiliser qu'une seule barre de recherche universelle et comprendre automatiquement l'intention de l'utilisateur.

Voici les 17 exigences strictes du cahier des charges que tu dois implémenter (fournis-moi l'architecture technique, les schémas de données, l'algorithme d'indexation, et le code d'implémentation backend/frontend de référence, par exemple en Node.js/PostgreSQL ou Elasticsearch/Meilisearch selon ce qui est le plus adapté) :

1. Recherche dans les données réelles des structures : Le moteur cherche dynamiquement dans les stocks/services réels des pharmacies, hôpitaux et laboratoires, jamais dans un catalogue figé.
2. Temps réel (Live Search) : Analyse de la saisie et suggestions dès les premières frappes sans clic sur un bouton.
3. Tolérance aux fautes d'orthographe & 4. Fuzzy Search : Gestion automatique des coquilles (ex: "Cardilogie" -> "Cardiologie", "Paracétamol").
5. Normalisation stricte : Avant indexation/recherche, normaliser le texte (suppression des accents, minuscules, espaces superflus, caractères spéciaux).
6. Suggestions intelligentes : Propositions automatiques contextuelles basées sur les données réelles (ex: "Par" -> "Paracétamol", "Paracétamol 500mg").
7. Classement multicritère : Pertinence textuelle + Distance géographique (GPS) + Disponibilité + (extensible pour la qualité).
8. Géolocalisation intégrée : Calcul de la distance par rapport à l'utilisateur et tri par proximité.
9 & 12. Recherche unifiée & Différenciation automatique des intentions : Une seule barre de recherche. Le moteur détecte automatiquement si l'utilisateur cherche un médicament (-> pharmacies), une maladie (-> hôpitaux/services), une analyse (-> labos), un plateau technique (-> hôpitaux équipés) ou un service médical.
10. Historique utilisateur : Mémorisation et suggestion rapide des dernières recherches.
11 & 14. Performance et Synchronisation automatique : Utilisation d'un index de recherche (ex: Meilisearch, Typesense ou tables d'index dédiées) mis à jour automatiquement en temps réel après tout ajout, modification, suppression ou import Excel.
13. Résultats riches : Retourner un objet structuré contenant : nom, type de structure, distance, adresse, téléphone, statut (ouvert/fermé) et l'élément exact trouvé.
15. Extensibilité : Architecture pensée pour intégrer plus tard la recherche vocale, par image, multilingue et les synonymes médicaux.
16. Recherche multi-mots (Requêtes composées) : Traitement intelligent de requêtes complexes (ex: "Paracétamol Yaoundé", "Cardiologue ouvert", "Pharmacie de garde").
17. Compréhension des intentions conversationnelles : Traduction de phrases en requêtes ciblées (ex: "J'ai une fracture" -> recherche de services d'urgences/traumatologie ; "Où trouver du paracétamol ?" -> recherche de médicament).

Pour chaque point, détaille :
- La structure des données / schéma d'index.
- L'algorithme ou la logique de traitement.
- Un exemple concret de code d'implémentation propre et commenté.