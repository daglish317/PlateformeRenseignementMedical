"""
Moteur de recherche public — médicament → pharmacies ouvertes disposant du produit.

Le moteur interroge les sources de vérité en direct (jamais un index figé) :
  StockItem.quantite  → stock réel (§3, §31)
  LigneApprovisionnement → péremption (§11)
  Horaire             → ouverture (§12, §13, §32)
  Structure           → type/statut/localisation (§2, §15)

Filtrage 100 % côté serveur, pagination stricte (§18, §33).
"""
from math import atan2, cos, radians, sin, sqrt

from core.utils.text import normaliser_texte
from stock.services import StockService
from structures.models import Structure
from structures.services import HoraireService


class PublicPharmacySearchEngine:

    VITESSE_MARCHE_KMH = 5
    VITESSE_VOITURE_KMH = 30

    # ------------------------------------------------------------------
    # Calculs géographiques
    # ------------------------------------------------------------------

    @staticmethod
    def _distance_km(lat1, lon1, lat2, lon2):
        """Distance Haversine en km entre deux points."""
        if None in (lat1, lon1, lat2, lon2):
            return None
        lat1, lon1, lat2, lon2 = map(float, (lat1, lon1, lat2, lon2))
        R = 6371
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = (
            sin(dlat / 2) ** 2
            + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        )
        return R * 2 * atan2(sqrt(a), sqrt(1 - a))

    @staticmethod
    def _temps_minutes(distance_km, vitesse_kmh):
        """Temps de trajet estimé en minutes (déterministe, jamais inventé)."""
        if distance_km is None or vitesse_kmh <= 0:
            return None
        return max(1, round(distance_km / vitesse_kmh * 60))

    # ------------------------------------------------------------------
    # Suggestions
    # ------------------------------------------------------------------

    @classmethod
    def suggestions(cls, requete, limite=8):
        """Suggestions issues des données réelles du système (§5, §6)."""
        noms = StockService.suggestions_medicaments(requete, limite=limite)
        return [
            {"text": nom, "type": "MEDICAMENT"}
            for nom in noms
        ]

    # ------------------------------------------------------------------
    # Recherche principale
    # ------------------------------------------------------------------

    @classmethod
    def search(cls, query, user_lat=None, user_lon=None, page=1, page_size=20):
        """
        Retourne les (pharmacie, produit) éligibles pour la recherche.

        Éligibilité (chaîne §2) :
          1. produit correspondant (nom, insensible à la casse) ;
          2. stock disponible > 0 ;
          3. produit non périmé ;
          4. pharmacie active (statut ACTIVE, non supprimée) ;
          5. pharmacie actuellement ouverte ;
          6. localisation exploitable.
        """
        query = (query or "").strip()
        if not query:
            return {"results": [], "total": 0, "normalized_query": ""}

        # 1-3-4-6 : candidats en base (stock > 0, non périmé, pharmacie active + GPS)
        candidats = StockService.produits_publics_globaux(recherche=query)
        candidats = list(
            candidats.select_related("structure").values(
                "id",
                "nom",
                "quantite",
                "quantite_reservee",
                "structure_id",
                "structure__nom",
                "structure__type",
                "structure__adresse",
                "structure__telephone",
                "structure__photo",
                "structure__latitude",
                "structure__longitude",
            )
        )

        # 5 : pharmacies actuellement ouvertes (horaires officiels, §12-13, §32)
        structure_ids = {c["structure_id"] for c in candidats}
        structures = Structure.objects.filter(id__in=structure_ids).prefetch_related(
            "horaires"
        )
        ouvertes = {
            s.id
            for s in structures
            if HoraireService.est_ouverte(s, horaires=s.horaires.all())
        }

        lignes = [c for c in candidats if c["structure_id"] in ouvertes]

        # Géographie (§15) : distance + temps estimés, tri par proximité.
        for ligne in lignes:
            distance = cls._distance_km(
                user_lat,
                user_lon,
                ligne["structure__latitude"],
                ligne["structure__longitude"],
            )
            ligne["distance_km"] = distance
            ligne["temps_marche_min"] = cls._temps_minutes(
                distance, cls.VITESSE_MARCHE_KMH
            )
            ligne["temps_voiture_min"] = cls._temps_minutes(
                distance, cls.VITESSE_VOITURE_KMH
            )

        if user_lat is not None and user_lon is not None:
            lignes.sort(key=lambda c: (c["distance_km"] is None, c["distance_km"] or 0, c["nom"].lower()))
        else:
            lignes.sort(key=lambda c: c["nom"].lower())

        total = len(lignes)
        start = (page - 1) * page_size
        page_lignes = lignes[start:start + page_size]

        results = [
            {
                "id": str(ligne["id"]),
                "produit": {
                    "nom": ligne["nom"],
                    "quantite": max(
                        ligne["quantite"] - ligne["quantite_reservee"], 0
                    ),
                },
                "structure": {
                    "id": str(ligne["structure_id"]),
                    "nom": ligne["structure__nom"],
                    "type": ligne["structure__type"],
                    "adresse": ligne["structure__adresse"],
                    "telephone": ligne["structure__telephone"],
                    "photo": ligne["structure__photo"],
                    "latitude": ligne["structure__latitude"],
                    "longitude": ligne["structure__longitude"],
                },
                "est_ouverte": True,
                "distance_km": (
                    round(ligne["distance_km"], 2)
                    if ligne["distance_km"] is not None
                    else None
                ),
                "temps_marche_min": ligne["temps_marche_min"],
                "temps_voiture_min": ligne["temps_voiture_min"],
            }
            for ligne in page_lignes
        ]

        return {
            "results": results,
            "total": total,
            "normalized_query": normaliser_texte(query),
        }
