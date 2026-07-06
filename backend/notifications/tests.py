from django.test import TestCase

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from notifications.models import Notification
from notifications.service import NotificationService


class NotificationTests(TestCase):

    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            email="n@test.com",
            password="pass",
            nom="N",
            role=RoleUtilisateur.PATIENT,
            type_authentification=TypeAuthentification.EMAIL,
        )

    def test_create_notification(self):
        notif = NotificationService.envoyer(
            utilisateur=self.user,
            titre="Test",
            message="Message test",
            type="SYSTEM",
        )
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(notif.titre, "Test")
