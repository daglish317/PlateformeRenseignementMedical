from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification


class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_register_patient(self):
        response = self.client.post("/api/utilisateurs/register/", {
            "nom": "Patient Test",
            "email": "patient@test.com",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn("tokens", response.data)
        self.assertTrue(Utilisateur.objects.filter(email="patient@test.com").exists())

    def test_login_invalid(self):
        response = self.client.post("/api/utilisateurs/login/", {
            "email": "unknown@test.com",
            "password": "wrong",
        })
        self.assertEqual(response.status_code, 401)

    def test_me_requires_auth(self):
        response = self.client.get("/api/utilisateurs/me/")
        self.assertEqual(response.status_code, 401)

    def test_me_authenticated(self):
        user = Utilisateur.objects.create_user(
            email="me@test.com",
            password="password123",
            nom="Me",
            role=RoleUtilisateur.PATIENT,
            type_authentification=TypeAuthentification.EMAIL,
        )
        login = self.client.post("/api/utilisateurs/login/", {
            "email": "me@test.com",
            "password": "password123",
        })
        token = login.data["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/utilisateurs/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "me@test.com")
