from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from catalogues.models import Catalogue, TypeCatalogue


class CatalogueTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_user(
            email="admin@test.com",
            password="password123",
            nom="Admin",
            role=RoleUtilisateur.ADMINISTRATEUR,
            type_authentification=TypeAuthentification.EMAIL,
        )
        login = self.client.post("/api/utilisateurs/login/", {
            "email": "admin@test.com",
            "password": "password123",
        })
        self.token = login.data["tokens"]["access"]

    def test_admin_create_catalogue(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post("/api/catalogues/create/", {
            "nom": "Paludisme",
            "type": TypeCatalogue.MALADIE,
            "description": "Maladie",
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Catalogue.objects.filter(nom="Paludisme").exists())

    def test_catalogue_uniqueness(self):
        Catalogue.objects.create(nom="Paludisme", type=TypeCatalogue.MALADIE)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = self.client.post("/api/catalogues/create/", {
            "nom": "Paludisme",
            "type": TypeCatalogue.MALADIE,
        })
        self.assertEqual(response.status_code, 400)
