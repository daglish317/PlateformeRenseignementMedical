"""
Tests du moteur de recherche public (spec moteurRecherche.md).

Couvre la chaîne d'éligibilité (§2), la casse (§4), la recherche partielle (§5),
les suggestions (§5-6), le stock (§10, §17), la péremption (§11), l'ouverture
(§12-13, §32), la géolocalisation et le tri (§15), la pagination (§18), la fiche
publique (§27-28, §30) et la recherche interne (§29).
"""
from datetime import datetime, time, timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from stock.services import ApprovisionnementService
from structures.models import (
    Horaire,
    JourSemaine,
    StatutStructure,
    Structure,
    TypeStructure,
)
from structures.services import HoraireService
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur


class PublicSearchTestBase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.utilisateur = Utilisateur.objects.create_user(
            email="responsable@test.com",
            password="pass",
            nom="Responsable",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _pharmacie(
        self,
        nom="Pharmacie A",
        lat="3.848000",
        lon="11.502100",
        statut=StatutStructure.ACTIVE,
    ):
        return Structure.objects.create(
            nom=nom,
            type=TypeStructure.PHARMACIE,
            adresse="Rue du Test",
            telephone="0102030405",
            statut=statut,
            latitude=lat,
            longitude=lon,
        )

    def _horaires_toujours_ouverts(self, structure):
        for jour in [c[0] for c in JourSemaine.choices]:
            Horaire.objects.create(
                structure=structure,
                jour=jour,
                heure_ouverture=time(0, 0),
                heure_fermeture=time(23, 59),
            )

    def _horaires_toujours_fermes(self, structure):
        for jour in [c[0] for c in JourSemaine.choices]:
            Horaire.objects.create(
                structure=structure,
                jour=jour,
                heure_ouverture=time(0, 0),
                heure_fermeture=time(23, 59),
                est_ferme=True,
            )

    def _ajouter_stock(
        self,
        structure,
        nom,
        quantite,
        date_peremption,
        forme="COMPRIME",
    ):
        montant = quantite * 100
        return ApprovisionnementService.enregistrer(
            structure=structure,
            cree_par=self.utilisateur,
            date_reception=timezone.localdate(),
            fournisseur="Fournisseur Test",
            montant_total_declare=montant,
            lignes=[
                {
                    "nom": nom,
                    "forme_pharmaceutique": forme,
                    "quantite": quantite,
                    "prix_achat": 100,
                    "prix_vente": 150,
                    "date_peremption": date_peremption,
                    "tva": False,
                    "en_reserve": False,
                }
            ],
        )

    def _recherche(self, q, **params):
        return self.client.get("/api/search/public/pharmacies/", {"q": q, **params})


class EligibilityTests(PublicSearchTestBase):
    """Chaîne d'éligibilité (§2) : produit → stock → péremption → active → ouverte → GPS."""

    def test_pharmacie_ouverte_avec_stock_eligible(self):
        pharmacie = self._pharmacie()
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=20,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        resultat = response.data["results"][0]
        self.assertEqual(resultat["produit"]["nom"], "Paracétamol")
        self.assertEqual(resultat["produit"]["quantite"], 20)
        self.assertEqual(resultat["structure"]["nom"], "Pharmacie A")
        self.assertTrue(resultat["est_ouverte"])

    def test_pharmacie_fermee_exclue(self):
        pharmacie = self._pharmacie(nom="Pharmacie Fermée")
        self._horaires_toujours_fermes(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=50,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 0)

    def test_pharmacie_sans_horaires_exclue(self):
        pharmacie = self._pharmacie(nom="Sans horaires")
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=5,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["total"], 0)

    def test_stock_nul_exclu(self):
        pharmacie = self._pharmacie(nom="Stock nul")
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=5,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )
        from stock.models import StockItem

        StockItem.objects.filter(
            structure=pharmacie, nom="Paracétamol"
        ).update(quantite=0)

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["total"], 0)

    def test_produit_expire_exclu_meme_avec_stock(self):
        pharmacie = self._pharmacie(nom="Expiré")
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() - timedelta(days=5),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["total"], 0)

    def test_produit_partiellement_perime_inclus(self):
        pharmacie = self._pharmacie(nom="Mixte")
        self._horaires_toujours_ouverts(pharmacie)
        # Un lot périmé + un lot valide → produit disponible au public.
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() - timedelta(days=5),
        )
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=8,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["results"][0]["produit"]["quantite"], 18)

    def test_pharmacie_inactive_exclue(self):
        pharmacie = self._pharmacie(
            nom="En attente", statut=StatutStructure.EN_ATTENTE
        )
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["total"], 0)


class TexteEtSuggestionsTests(PublicSearchTestBase):
    """Casse (§4), recherche partielle (§5), suggestions (§5-6)."""

    def setUp(self):
        super().setUp()
        self.pharmacie = self._pharmacie()
        self._horaires_toujours_ouverts(self.pharmacie)
        self._ajouter_stock(
            self.pharmacie,
            "Paracétamol 500 mg",
            quantite=15,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

    def test_insensible_a_la_casse(self):
        for requete in ("PARACETAMOL", "Paracetamol", "PaRaCeTaMoL"):
            response = self._recherche(requete)
            self.assertEqual(response.data["total"], 1, requete)

    def test_recherche_partielle(self):
        response = self._recherche("para")
        self.assertEqual(response.data["total"], 1)

    def test_recherche_vide_affiche_les_structures_proches(self):
        lointaine = self._pharmacie(
            nom="Lointaine",
            lat="3.900000",
            lon="11.650000",
        )
        self._horaires_toujours_ouverts(lointaine)
        self._ajouter_stock(
            lointaine,
            "Paracétamol lointain",
            quantite=8,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self.client.get(
            "/api/search/public/pharmacies/",
            {"lat": "3.848000", "lon": "11.502100"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 2)
        self.assertEqual(response.data["results"][0]["structure"]["nom"], "Pharmacie A")
        self.assertEqual(response.data["results"][1]["structure"]["nom"], "Lointaine")
        self.assertEqual(len(response.data["map_results"]), 2)

    def test_aucune_invention_de_medicament(self):
        response = self._recherche("médicament-inexistant")
        self.assertEqual(response.data["total"], 0)

    def test_suggestions_depuis_donnees_reelles(self):
        response = self.client.get(
            "/api/search/public/suggestions/", {"q": "para"}
        )
        self.assertEqual(response.status_code, 200)
        noms = [s["text"] for s in response.data["suggestions"]]
        self.assertIn("Paracétamol 500 mg", noms)
        self.assertTrue(all(s["type"] == "MEDICAMENT" for s in response.data["suggestions"]))

    def test_suggestions_insensibles_a_la_casse(self):
        response = self.client.get(
            "/api/search/public/suggestions/", {"q": "PARA"}
        )
        noms = [s["text"] for s in response.data["suggestions"]]
        self.assertIn("Paracétamol 500 mg", noms)


class DisponibiliteEtGeoTests(PublicSearchTestBase):
    """Quantité affichée (§17) et tri géographique (§15)."""

    def test_quantite_affichable_est_le_stock_disponible(self):
        pharmacie = self._pharmacie()
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )
        from stock.models import StockItem

        StockItem.objects.filter(
            structure=pharmacie, nom="Paracétamol"
        ).update(quantite_reservee=4)

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["results"][0]["produit"]["quantite"], 6)

    def test_tri_par_proximite(self):
        # Utilisateur à (3.8480, 11.5021).
        proche = self._pharmacie(nom="Proche", lat="3.848200", lon="11.502300")
        lointaine = self._pharmacie(nom="Lointaine", lat="3.868000", lon="11.522100")
        for pharmacie in (proche, lointaine):
            self._horaires_toujours_ouverts(pharmacie)
            self._ajouter_stock(
                pharmacie,
                "Paracétamol",
                quantite=10,
                date_peremption=timezone.localdate() + timedelta(days=365),
            )

        response = self._recherche(
            "paracétamol", lat="3.8480", lon="11.5021"
        )

        self.assertEqual(response.data["total"], 2)
        noms = [r["structure"]["nom"] for r in response.data["results"]]
        self.assertEqual(noms, ["Proche", "Lointaine"])
        self.assertLess(
            response.data["results"][0]["distance_km"],
            response.data["results"][1]["distance_km"],
        )
        self.assertIsNotNone(response.data["results"][0]["temps_marche_min"])
        self.assertIsNotNone(response.data["results"][0]["temps_voiture_min"])

    def test_sans_position_aucune_distance_inventee(self):
        pharmacie = self._pharmacie()
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("paracétamol")

        self.assertEqual(response.data["results"][0]["distance_km"], None)
        self.assertEqual(response.data["user_location"], None)


class PaginationTests(PublicSearchTestBase):
    """Pagination stricte (§18), jamais toutes les pharmacies en une réponse."""

    def test_pagination_par_lots(self):
        for i in range(25):
            pharmacie = self._pharmacie(nom=f"Pharmacie {i}")
            self._horaires_toujours_ouverts(pharmacie)
            self._ajouter_stock(
                pharmacie,
                "Paracétamol",
                quantite=10,
                date_peremption=timezone.localdate() + timedelta(days=365),
            )

        page1 = self._recherche("paracétamol", page=1, page_size=10)
        self.assertEqual(page1.data["total"], 25)
        self.assertEqual(len(page1.data["results"]), 10)
        self.assertTrue(page1.data["has_next"])

        page2 = self._recherche("paracétamol", page=2, page_size=10)
        self.assertEqual(len(page2.data["results"]), 10)

        page3 = self._recherche("paracétamol", page=3, page_size=10)
        self.assertEqual(len(page3.data["results"]), 5)
        self.assertFalse(page3.data["has_next"])

    def test_q_obligatoire(self):
        pharmacie = self._pharmacie(nom="Sans requête")
        self._horaires_toujours_ouverts(pharmacie)
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self._recherche("")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertFalse(response.data["has_next"])


class MultiPeriodesTests(PublicSearchTestBase):
    """Horaires multiples dans une même journée (§13)."""

    def test_deux_periodes_dans_la_journee(self):
        pharmacie = self._pharmacie()
        Horaire.objects.create(
            structure=pharmacie,
            jour=JourSemaine.LUNDI,
            heure_ouverture=time(8, 0),
            heure_fermeture=time(13, 0),
            position=0,
        )
        Horaire.objects.create(
            structure=pharmacie,
            jour=JourSemaine.LUNDI,
            heure_ouverture=time(15, 0),
            heure_fermeture=time(20, 0),
            position=1,
        )

        lundi_midi = timezone.make_aware(datetime(2026, 1, 5, 12, 0))  # Lundi
        lundi_14h = timezone.make_aware(datetime(2026, 1, 5, 14, 0))
        lundi_16h = timezone.make_aware(datetime(2026, 1, 5, 16, 0))

        self.assertTrue(HoraireService.est_ouverte(pharmacie, moment=lundi_midi))
        self.assertFalse(HoraireService.est_ouverte(pharmacie, moment=lundi_14h))
        self.assertTrue(HoraireService.est_ouverte(pharmacie, moment=lundi_16h))

    def test_plage_qui_traverse_minuit_reste_ouverte_le_lendemain(self):
        pharmacie = self._pharmacie(nom="Garde de nuit")
        Horaire.objects.create(
            structure=pharmacie,
            jour=JourSemaine.LUNDI,
            heure_ouverture=time(20, 0),
            heure_fermeture=time(6, 0),
            position=0,
        )
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        mardi_2h = timezone.make_aware(datetime(2026, 1, 6, 2, 0))
        with patch("structures.services.timezone.localtime", return_value=mardi_2h):
            response = self._recherche("paracétamol")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["results"][0]["structure"]["nom"], "Garde de nuit")

    def test_meme_heure_ouverture_fermeture_signifie_24h_sur_24(self):
        pharmacie = self._pharmacie(nom="Pharmacie 24h")
        Horaire.objects.create(
            structure=pharmacie,
            jour=JourSemaine.MARDI,
            heure_ouverture=time(0, 0),
            heure_fermeture=time(0, 0),
            position=0,
        )
        self._ajouter_stock(
            pharmacie,
            "Paracétamol",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        mardi_18h = timezone.make_aware(datetime(2026, 1, 6, 18, 0))
        with patch("structures.services.timezone.localtime", return_value=mardi_18h):
            response = self._recherche("paracétamol")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["results"][0]["structure"]["nom"], "Pharmacie 24h")


class FichePubliqueTests(PublicSearchTestBase):
    """Fiche publique (§27-28) : données publiques uniquement (§30)."""

    def setUp(self):
        super().setUp()
        self.pharmacie = self._pharmacie()
        Horaire.objects.create(
            structure=self.pharmacie,
            jour=JourSemaine.LUNDI,
            heure_ouverture=time(8, 0),
            heure_fermeture=time(13, 0),
            position=0,
        )
        Horaire.objects.create(
            structure=self.pharmacie,
            jour=JourSemaine.LUNDI,
            heure_ouverture=time(15, 0),
            heure_fermeture=time(20, 0),
            position=1,
        )
        self._ajouter_stock(
            self.pharmacie,
            "Paracétamol 500 mg",
            quantite=24,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )
        self._ajouter_stock(
            self.pharmacie,
            "Ibuprofène",
            quantite=8,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

    def test_detail_public_horaires_et_produits(self):
        response = self.client.get(f"/api/structures/{self.pharmacie.id}/")
        self.assertEqual(response.status_code, 200)

        data = response.data
        self.assertEqual(data["nom"], "Pharmacie A")
        self.assertIn("est_ouverte", data)
        self.assertIn("horaires", data)
        self.assertIn("produits", data)

        lundi = next(h for h in data["horaires"] if h["jour"] == "LUNDI")
        self.assertEqual(len(lundi["plages"]), 2)

        noms_produits = [p["nom"] for p in data["produits"]]
        self.assertIn("Paracétamol 500 mg", noms_produits)
        self.assertIn("Ibuprofène", noms_produits)
        self.assertEqual(data["produits_total"], 2)

    def test_detail_public_n_expose_aucune_donnee_interne(self):
        response = self.client.get(f"/api/structures/{self.pharmacie.id}/")
        data = response.data
        for champ_interdit in (
            "prix_vente",
            "prix_achat",
            "fournisseur",
            "approvisionnements",
            "statut",
            "motif_refus",
            "gestionnaire",
            "proprietaire",
            "date_validation",
        ):
            self.assertNotIn(champ_interdit, data, champ_interdit)

    def test_recherche_interne_limitee_a_la_pharmacie(self):
        autre = self._pharmacie(nom="Autre Pharmacie")
        self._ajouter_stock(
            autre,
            "Paracétamol sirop",
            quantite=10,
            date_peremption=timezone.localdate() + timedelta(days=365),
        )

        response = self.client.get(
            f"/api/structures/{self.pharmacie.id}/produits/", {"q": "para"}
        )

        self.assertEqual(response.status_code, 200)
        noms = [p["nom"] for p in response.data["results"]]
        self.assertEqual(noms, ["Paracétamol 500 mg"])
        self.assertEqual(response.data["total"], 1)

    def test_recherche_interne_applique_disponibilite(self):
        # Produit en stock nul → absent de la recherche interne.
        from stock.models import StockItem

        StockItem.objects.filter(
            structure=self.pharmacie, nom="Ibuprofène"
        ).update(quantite=0)

        response = self.client.get(
            f"/api/structures/{self.pharmacie.id}/produits/", {"q": "ibu"}
        )

        self.assertEqual(response.data["total"], 0)

    def test_detail_pharmacie_inexistante(self):
        from uuid import uuid4

        response = self.client.get(f"/api/structures/{uuid4()}/")
        self.assertEqual(response.status_code, 404)


class RoutingTests(PublicSearchTestBase):
    """Itinéraire praticable (§24-26)."""

    def test_itineraire_requiert_les_coordonnees(self):
        response = self.client.get("/api/routing/")
        self.assertEqual(response.status_code, 400)

    def test_itineraire_reel_quand_le_service_repond(self):
        from unittest.mock import patch

        fake = {
            "routes": [
                {
                    "geometry": {
                        "coordinates": [
                            [11.5021, 3.8480],
                            [11.5040, 3.8490],
                            [11.5060, 3.8500],
                        ]
                    },
                    "distance": 480.5,
                    "duration": 72.3,
                }
            ]
        }
        with patch("search.views_routing._appel_osrm", return_value=fake):
            response = self.client.get(
                "/api/routing/",
                {
                    "start_lat": "3.8480",
                    "start_lng": "11.5021",
                    "end_lat": "3.8500",
                    "end_lng": "11.5060",
                },
            )

        self.assertEqual(response.status_code, 200)
        route = response.data["route"]
        # L'ordre des coordonnées est [lat, lng] (attendu par Leaflet).
        self.assertEqual(route["coordinates"][0], [3.8480, 11.5021])
        self.assertEqual(route["distance"], 480.5)
        self.assertEqual(route["duration"], 72.3)

    def test_repli_deterministe_si_service_indisponible(self):
        from unittest.mock import patch

        with patch("search.views_routing._appel_osrm", side_effect=OSError("offline")):
            response = self.client.get(
                "/api/routing/",
                {
                    "start_lat": "3.8480",
                    "start_lng": "11.5021",
                    "end_lat": "3.8500",
                    "end_lng": "11.5060",
                },
            )

        self.assertEqual(response.status_code, 200)
        route = response.data["route"]
        self.assertEqual(len(route["coordinates"]), 2)
        self.assertEqual(route["coordinates"][0], [3.8480, 11.5021])
        self.assertEqual(route["coordinates"][1], [3.8500, 11.5060])
        self.assertGreater(route["distance"], 0)
        self.assertGreater(route["duration"], 0)
