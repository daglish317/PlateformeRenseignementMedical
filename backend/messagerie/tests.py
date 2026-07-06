from django.test import TestCase
from rest_framework.test import APIClient

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from structures.models import Structure, StatutStructure, TypeStructure
from messagerie.services import MessagerieService


class MessagerieTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = Utilisateur.objects.create_user(
            email="admin2@test.com",
            password="pass",
            nom="Admin",
            role=RoleUtilisateur.ADMINISTRATEUR,
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
            gestionnaire=self.gestionnaire,
        )

    def test_conversation_and_message(self):
        conversation = MessagerieService.get_or_create_conversation(structure=self.structure)
        message = MessagerieService.envoyer_message(
            conversation=conversation,
            expediteur=self.admin,
            contenu="Bonjour",
        )
        self.assertEqual(message.contenu, "Bonjour")
        self.assertTrue(MessagerieService.peut_acceder(user=self.admin, conversation=conversation))
        self.assertTrue(MessagerieService.peut_acceder(user=self.gestionnaire, conversation=conversation))
