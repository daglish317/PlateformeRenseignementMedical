from django.test import TestCase

from catalogues.models import Catalogue, TypeCatalogue
from structures.models import Structure, StatutStructure, TypeStructure
from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from prise_en_charge.models import PriseEnCharge
from search.services.search_service import SearchService


class SearchTests(TestCase):

    def setUp(self):
        self.catalogue = Catalogue.objects.create(
            nom="Paludisme",
            type=TypeCatalogue.MALADIE,
        )
        self.gestionnaire = Utilisateur.objects.create_user(
            email="g@test.com",
            password="pass",
            nom="G",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
        )
        self.structure = Structure.objects.create(
            nom="Pharmacie Centre",
            type=TypeStructure.PHARMACIE,
            adresse="Centre",
            telephone="0101010101",
            statut=StatutStructure.ACTIVE,
            gestionnaire=self.gestionnaire,
            latitude="5.360000",
            longitude="-4.008300",
        )
        PriseEnCharge.objects.create(
            structure=self.structure,
            catalogue=self.catalogue,
            niveau="COMPLET",
        )

    def test_fuzzy_search(self):
        result = SearchService.search("palu")
        self.assertIsNotNone(result["catalogue"])
        self.assertGreaterEqual(result["total"], 1)
