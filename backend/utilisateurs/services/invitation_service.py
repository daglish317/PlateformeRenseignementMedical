from django.db import transaction
from django.utils import timezone

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification

from core.verification.service import VerificationService
from django.utils import timezone

from core.verification.session import VerificationSession
from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes


class InvitationService:

    @staticmethod
    @transaction.atomic
    def inviter_gestionnaire(*, nom, email):

        email = email.lower().strip()

        if Utilisateur.objects.filter(email=email).exists():
            raise ValueError("Un utilisateur existe déjà avec cet email.")

        gestionnaire = Utilisateur.objects.create(
            nom=nom.strip(),
            email=email,
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            is_active=False,
            email_verifie=False,
        )
        gestionnaire.set_unusable_password()
        gestionnaire.save()

        VerificationService.generate(email=email)

        EventDispatcher.dispatch(
            EventTypes.USER_INVITED,
            {"utilisateur": gestionnaire, "email": email},
        )

        return gestionnaire

    @staticmethod
    @transaction.atomic
    def valider_otp(*, email, code):

        email = email.lower().strip()
        is_valid = VerificationService.check(email=email, code=code)

        if not is_valid:
            raise ValueError("Code invalide ou expiré.")

        utilisateur = Utilisateur.objects.filter(email=email).first()
        if not utilisateur:
            raise ValueError("Utilisateur introuvable.")

        return utilisateur

    @staticmethod
    @transaction.atomic
    def definir_mot_de_passe(*, email, password):

        email = email.lower().strip()

        session = VerificationSession.objects.filter(
            email=email,
            is_verified=True,
            expires_at__gt=timezone.now(),
        ).first()

        if not session:
            raise ValueError("Session OTP expirée. Validez à nouveau votre code.")

        utilisateur = Utilisateur.objects.filter(email=email).first()
        if not utilisateur or utilisateur.role != RoleUtilisateur.GESTIONNAIRE:
            raise ValueError("Utilisateur gestionnaire introuvable.")

        utilisateur.set_password(password)
        utilisateur.is_active = True
        utilisateur.email_verifie = True
        utilisateur.save(update_fields=["password", "is_active", "email_verifie"])

        return utilisateur
