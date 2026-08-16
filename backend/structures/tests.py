from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from core.verification.session import VerificationSession
from django.utils import timezone
from datetime import timedelta
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    StatutStructure,
    TypeStructure,
)


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

    def _create_owner_structure_team(self, member_status=StatutEquipeStructure.ACTIF):
        owner = Utilisateur.objects.create_user(
            email="owner@test.com",
            password="password123",
            nom="Owner",
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        structure = Structure.objects.create(
            nom="Pharmacie Owner",
            type=TypeStructure.PHARMACIE,
            adresse="Rue 2",
            telephone="0102030406",
            statut=StatutStructure.EN_ATTENTE,
        )
        EquipeStructure.objects.create(
            structure=structure,
            utilisateur=owner,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
            date_activation=timezone.now(),
        )
        member = Utilisateur.objects.create_user(
            email="member@test.com",
            password="password123",
            nom="Member",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        membership = EquipeStructure.objects.create(
            structure=structure,
            utilisateur=member,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=member_status,
            date_activation=timezone.now() if member_status == StatutEquipeStructure.ACTIF else None,
        )
        return owner, member, membership

    def test_owner_can_deactivate_structure_member(self):
        owner, member, membership = self._create_owner_structure_team()
        self.client.force_authenticate(user=owner)

        response = self.client.patch(
            f"/api/structures/team/{membership.id}/status/",
            {"action": "DEACTIVATE"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        member.refresh_from_db()
        self.assertEqual(membership.statut, StatutEquipeStructure.SUSPENDU)
        self.assertFalse(member.is_active)

    def test_owner_can_reactivate_registered_structure_member(self):
        owner, member, membership = self._create_owner_structure_team(
            member_status=StatutEquipeStructure.SUSPENDU
        )
        member.is_active = False
        member.save(update_fields=["is_active"])
        self.client.force_authenticate(user=owner)

        response = self.client.patch(
            f"/api/structures/team/{membership.id}/status/",
            {"action": "ACTIVATE"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        member.refresh_from_db()
        self.assertEqual(membership.statut, StatutEquipeStructure.ACTIF)
        self.assertTrue(member.is_active)

    def test_owner_reactivates_unregistered_member_as_invited(self):
        owner, member, membership = self._create_owner_structure_team(
            member_status=StatutEquipeStructure.SUSPENDU
        )
        member.set_unusable_password()
        member.is_active = False
        member.email_verifie = False
        member.save(update_fields=["password", "is_active", "email_verifie"])
        self.client.force_authenticate(user=owner)

        response = self.client.patch(
            f"/api/structures/team/{membership.id}/status/",
            {"action": "ACTIVATE"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        membership.refresh_from_db()
        member.refresh_from_db()
        self.assertEqual(membership.statut, StatutEquipeStructure.INVITE)
        self.assertFalse(member.is_active)

    def test_owner_cannot_save_empty_member_permissions(self):
        owner, member, membership = self._create_owner_structure_team()
        self.client.force_authenticate(user=owner)

        response = self.client.put(
            f"/api/structures/team/{membership.id}/permissions/",
            {"permissions": {}},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Au moins une permission", str(response.data))
