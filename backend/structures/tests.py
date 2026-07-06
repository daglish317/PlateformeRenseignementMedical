from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from core.verification.session import VerificationSession
from django.utils import timezone
from datetime import timedelta
from structures.models import Structure, StatutStructure, TypeStructure


class StructureTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.gestionnaire = Utilisateur.objects.create_user(
            email="gest@test.com",
            password="password123",
            nom="Gest",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        VerificationSession.objects.create(
            email="gest@test.com",
            is_verified=True,
            expires_at=timezone.now() + timedelta(minutes=30),
        )
        login = self.client.post("/api/utilisateurs/login/", {
            "email": "gest@test.com",
            "password": "password123",
        })
        self.token = login.data["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_structure_requires_otp_session(self):
        VerificationSession.objects.all().delete()
        response = self.client.post("/api/structures/create/", {
            "nom": "Hopital Test",
            "type": TypeStructure.HOPITAL,
            "adresse": "Rue 1",
            "telephone": "0102030405",
            "latitude": "5.360000",
            "longitude": "-4.008300",
        })
        self.assertEqual(response.status_code, 400)

    def test_create_structure_success(self):
        response = self.client.post("/api/structures/create/", {
            "nom": "Hopital Test",
            "type": TypeStructure.HOPITAL,
            "adresse": "Rue 1",
            "telephone": "0102030405",
            "latitude": "5.360000",
            "longitude": "-4.008300",
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Structure.objects.count(), 1)
        self.assertEqual(Structure.objects.first().statut, StatutStructure.EN_ATTENTE)
