from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from utilisateurs.services.invitation_service import InvitationService
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    TypeStructure,
)
from core.verification.code import VerificationCode
from core.verification.session import VerificationSession


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


class InvitationFlowTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.structure = Structure.objects.create(
            nom="Pharmacie Test",
            type=TypeStructure.PHARMACIE,
        )

    def test_inviter_membre_sans_email_ni_otp(self):
        InvitationService.inviter_caissier(
            nom="Caissier Test",
            email="caissier@test.com",
            structure=self.structure,
        )
        user = Utilisateur.objects.get(email="caissier@test.com")
        self.assertEqual(user.role, RoleUtilisateur.CAISSIER)
        self.assertFalse(user.is_active)
        self.assertFalse(user.email_verifie)
        self.assertFalse(VerificationCode.objects.filter(email="caissier@test.com").exists())
        self.assertTrue(
            EquipeStructure.objects.filter(
                utilisateur=user,
                statut=StatutEquipeStructure.INVITE,
            ).exists()
        )

    def test_check_membre_requires_otp_false(self):
        InvitationService.inviter_gestionnaire(
            nom="Gest Test",
            email="gest@test.com",
            structure=self.structure,
        )
        response = self.client.post("/api/utilisateurs/gestionnaire/check/", {
            "email": "gest@test.com",
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_invited"])
        self.assertFalse(response.data["requires_otp"])
        self.assertEqual(response.data["role"], RoleUtilisateur.GESTIONNAIRE)

    def test_check_proprietaire_requires_otp_true(self):
        InvitationService.inviter_proprietaire(
            nom="Proprio Test",
            email="proprio@test.com",
        )
        response = self.client.post("/api/utilisateurs/gestionnaire/check/", {
            "email": "proprio@test.com",
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_invited"])
        self.assertTrue(response.data["requires_otp"])
        self.assertEqual(response.data["role"], RoleUtilisateur.PROPRIETAIRE)

    def test_check_email_inexistant(self):
        response = self.client.post("/api/utilisateurs/gestionnaire/check/", {
            "email": "inconnu@test.com",
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_invited"])

    def test_activate_membre_sans_otp(self):
        InvitationService.inviter_caissier(
            nom="Caissier Test",
            email="caissier@test.com",
            structure=self.structure,
        )
        response = self.client.post("/api/utilisateurs/gestionnaire/activate/", {
            "email": "caissier@test.com",
            "nom": "Caissier Complet",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("tokens", response.data)
        user = Utilisateur.objects.get(email="caissier@test.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verifie)
        self.assertEqual(user.nom, "Caissier Complet")
        self.assertTrue(
            EquipeStructure.objects.filter(
                utilisateur=user,
                statut=StatutEquipeStructure.ACTIF,
            ).exists()
        )

    def test_register_active_membre_pre_enregistre(self):
        InvitationService.inviter_gestionnaire(
            nom="Nom Provisoire",
            email="gest-register@test.com",
            structure=self.structure,
        )

        response = self.client.post("/api/utilisateurs/register/", {
            "nom": "Gestionnaire Final",
            "email": "gest-register@test.com",
            "password": "password123",
        })

        self.assertEqual(response.status_code, 201)
        self.assertIn("tokens", response.data)
        self.assertEqual(response.data["user"]["role"], RoleUtilisateur.GESTIONNAIRE)

        user = Utilisateur.objects.get(email="gest-register@test.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verifie)
        self.assertEqual(user.nom, "Gestionnaire Final")
        self.assertTrue(user.check_password("password123"))
        self.assertTrue(
            EquipeStructure.objects.filter(
                utilisateur=user,
                statut=StatutEquipeStructure.ACTIF,
            ).exists()
        )

    def test_login_membre_hopital_expose_active_structure(self):
        hopital = Structure.objects.create(
            nom="Hopital Test",
            type=TypeStructure.HOPITAL,
        )
        InvitationService.inviter_gestionnaire(
            nom="Gest Hopital",
            email="gest-hopital@test.com",
            structure=hopital,
        )

        VerificationSession.objects.create(
            email="gest-hopital@test.com",
            is_verified=True,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        self.client.post("/api/utilisateurs/gestionnaire/activate/", {
            "nom": "Gestionnaire Hopital",
            "email": "gest-hopital@test.com",
            "password": "password123",
        })
        response = self.client.post("/api/utilisateurs/login/", {
            "email": "gest-hopital@test.com",
            "password": "password123",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], RoleUtilisateur.GESTIONNAIRE)
        self.assertEqual(response.data["user"]["active_structure"]["id"], str(hopital.id))
        self.assertEqual(response.data["user"]["active_structure"]["type"], TypeStructure.HOPITAL)

        token = response.data["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        permissions_response = self.client.get("/api/structures/me/permissions/")
        self.assertEqual(permissions_response.status_code, 200)
        self.assertTrue(permissions_response.data["full_access"])
        self.assertIn("PROFIL", permissions_response.data["modules"])

    def test_login_gestionnaire_hopital_legacy_expose_active_structure(self):
        gestionnaire = Utilisateur.objects.create_user(
            email="gest-hopital-legacy@test.com",
            password="password123",
            nom="Gest Hopital Legacy",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        hopital = Structure.objects.create(
            nom="Hopital Legacy",
            type=TypeStructure.HOPITAL,
            gestionnaire=gestionnaire,
        )

        response = self.client.post("/api/utilisateurs/login/", {
            "email": "gest-hopital-legacy@test.com",
            "password": "password123",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["active_structure"]["id"], str(hopital.id))
        self.assertEqual(response.data["user"]["active_structure"]["type"], TypeStructure.HOPITAL)

    def test_admin_invite_gestionnaire_hopital_cree_structure_hopital(self):
        admin = Utilisateur.objects.create_user(
            email="admin@test.com",
            password="password123",
            nom="Admin",
            role=RoleUtilisateur.ADMINISTRATEUR,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        response = self.client.post("/api/utilisateurs/admin/managers/", {
            "nom": "Gestionnaire Hopital",
            "email": "admin-hopital@test.com",
            "invitation_type": "GESTIONNAIRE_HOPITAL",
            "structure_nom": "Hopital Admin",
        })

        self.assertEqual(response.status_code, 201)
        user = Utilisateur.objects.get(email="admin-hopital@test.com")
        self.assertEqual(user.role, RoleUtilisateur.GESTIONNAIRE)
        structure = Structure.objects.get(gestionnaire=user)
        self.assertEqual(structure.type, TypeStructure.HOPITAL)
        self.assertEqual(structure.nom, "Hopital Admin")
        self.assertTrue(
            EquipeStructure.objects.filter(
                utilisateur=user,
                structure=structure,
                role=RoleEquipeStructure.GESTIONNAIRE,
                statut=StatutEquipeStructure.INVITE,
            ).exists()
        )
        self.assertTrue(VerificationCode.objects.filter(email="admin-hopital@test.com").exists())

    def test_check_gestionnaire_hopital_requires_otp_true(self):
        hopital = Structure.objects.create(
            nom="Hopital OTP",
            type=TypeStructure.HOPITAL,
        )
        InvitationService.inviter_gestionnaire(
            nom="Gest Hopital OTP",
            email="gest-hopital-otp@test.com",
            structure=hopital,
        )

        response = self.client.post("/api/utilisateurs/gestionnaire/check/", {
            "email": "gest-hopital-otp@test.com",
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_invited"])
        self.assertTrue(response.data["requires_otp"])
        self.assertEqual(response.data["role"], RoleUtilisateur.GESTIONNAIRE)

    def test_register_ne_peut_pas_activer_gestionnaire_hopital(self):
        hopital = Structure.objects.create(
            nom="Hopital Direct Register",
            type=TypeStructure.HOPITAL,
        )
        InvitationService.inviter_gestionnaire(
            nom="Gest Hopital Direct",
            email="gest-hopital-direct@test.com",
            structure=hopital,
        )

        response = self.client.post("/api/utilisateurs/register/", {
            "nom": "Gestionnaire Hopital Direct",
            "email": "gest-hopital-direct@test.com",
            "password": "password123",
        })

        self.assertEqual(response.status_code, 400)
        user = Utilisateur.objects.get(email="gest-hopital-direct@test.com")
        self.assertFalse(user.is_active)
        self.assertFalse(user.email_verifie)

    def test_activate_gestionnaire_hopital_avec_otp_valide(self):
        hopital = Structure.objects.create(
            nom="Hopital Activation",
            type=TypeStructure.HOPITAL,
        )
        InvitationService.inviter_gestionnaire(
            nom="Gest Hopital Activation",
            email="gest-hopital-activation@test.com",
            structure=hopital,
        )
        VerificationSession.objects.create(
            email="gest-hopital-activation@test.com",
            is_verified=True,
            expires_at=timezone.now() + timedelta(hours=24),
        )

        response = self.client.post("/api/utilisateurs/gestionnaire/activate/", {
            "email": "gest-hopital-activation@test.com",
            "nom": "Gestionnaire Hopital Active",
            "password": "password123",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], RoleUtilisateur.GESTIONNAIRE)
        self.assertEqual(response.data["user"]["active_structure"]["type"], TypeStructure.HOPITAL)
        user = Utilisateur.objects.get(email="gest-hopital-activation@test.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verifie)
        self.assertTrue(
            EquipeStructure.objects.filter(
                utilisateur=user,
                statut=StatutEquipeStructure.ACTIF,
            ).exists()
        )

    def test_activate_proprietaire_requiert_otp(self):
        InvitationService.inviter_proprietaire(
            nom="Proprio Test",
            email="proprio@test.com",
        )
        response = self.client.post("/api/utilisateurs/gestionnaire/activate/", {
            "email": "proprio@test.com",
            "nom": "Proprio Test",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 400)
        user = Utilisateur.objects.get(email="proprio@test.com")
        self.assertFalse(user.is_active)

    def test_activate_proprietaire_avec_otp_valide(self):
        InvitationService.inviter_proprietaire(
            nom="Proprio Test",
            email="proprio@test.com",
        )
        VerificationSession.objects.create(
            email="proprio@test.com",
            is_verified=True,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        response = self.client.post("/api/utilisateurs/gestionnaire/activate/", {
            "email": "proprio@test.com",
            "nom": "Proprio Test",
            "password": "password123",
        })
        self.assertEqual(response.status_code, 200)
        user = Utilisateur.objects.get(email="proprio@test.com")
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verifie)
