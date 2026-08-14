from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    StatutStructure,
    TypeStructure,
)
from messagerie.services import MessagerieService


class MessagerieTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.proprietaire = Utilisateur.objects.create_user(
            email="owner2@test.com",
            password="pass",
            nom="Owner",
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
        )
        self.gestionnaire = Utilisateur.objects.create_user(
            email="gest2@test.com",
            password="pass",
            nom="Gest",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
        )
        self.structure = Structure.objects.create(
            nom="Clinique",
            type=TypeStructure.HOPITAL,
            adresse="Adr",
            telephone="0101010101",
            statut=StatutStructure.ACTIVE,
            gestionnaire=self.proprietaire,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.proprietaire,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )

    def test_conversation_and_message(self):
        conversation = MessagerieService.get_or_create_conversation(structure=self.structure)
        message = MessagerieService.envoyer_message(
            conversation=conversation,
            expediteur=self.proprietaire,
            contenu="Bonjour",
        )
        self.assertEqual(message.contenu, "Bonjour")
        self.assertTrue(MessagerieService.peut_acceder(user=self.proprietaire, conversation=conversation))
        self.assertFalse(MessagerieService.peut_acceder(user=self.gestionnaire, conversation=conversation))
