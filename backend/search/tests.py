from django.test import TestCase

from structures.models import StructureService, Structure, StatutStructure, TypeStructure
from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from prise_en_charge.models import PriseEnCharge
from search.services.search_service import SearchService


class SearchTests(TestCase):

    def setUp(self):
        self.service_entry = StructureService.objects.create(
            nom="Paludisme",
            type="MALADIE",
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
            service=self.service_entry,
            niveau="COMPLET",
        )

    def test_fuzzy_search(self):
        result = SearchService.search("palu")
        self.assertIsNotNone(result["service"])
        self.assertGreaterEqual(result["total"], 1)
