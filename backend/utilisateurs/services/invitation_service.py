from django.db import transaction
from django.utils import timezone

from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes
from core.verification.service import VerificationService
from core.verification.session import VerificationSession
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur


class InvitationService:

    @staticmethod
    @transaction.atomic
    def inviter_proprietaire(*, nom, email):
        email = email.lower().strip()
        nom = nom.strip()

        if not nom:
            raise ValueError("Nom du proprietaire requis.")
        if Utilisateur.objects.filter(email=email).exists():
            raise ValueError("Un utilisateur existe deja avec cet email.")

        proprietaire = Utilisateur.objects.create(
            nom=nom,
            email=email,
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            is_active=False,
            email_verifie=False,
        )
        proprietaire.set_unusable_password()
        proprietaire.save()

        VerificationService.generate(email=email)

        EventDispatcher.dispatch(
            EventTypes.USER_INVITED,
            {"utilisateur": proprietaire, "email": email},
        )

        return proprietaire

    @staticmethod
    @transaction.atomic
    def inviter_gestionnaire(*, nom, email, structure):
        """Méthode legacy - utilisée pour la compatibilité"""
        return InvitationService._inviter_membre(
            nom=nom,
            email=email,
            structure=structure,
            role_utilisateur=RoleUtilisateur.GESTIONNAIRE,
            role_equipe=RoleEquipeStructure.GESTIONNAIRE,
        )

    @staticmethod
    @transaction.atomic
    def inviter_caissier(*, nom, email, structure):
        """Méthode legacy - utilisée pour la compatibilité"""
        return InvitationService._inviter_membre(
            nom=nom,
            email=email,
            structure=structure,
            role_utilisateur=RoleUtilisateur.CAISSIER,
            role_equipe=RoleEquipeStructure.CAISSIER,
        )

    @staticmethod
    @transaction.atomic
    def inviter_membre_structure(*, nom, email, structure, role_texte=None):
        """
        Nouvelle méthode pour inviter un membre avec un rôle personnalisé (texte libre).
        Le role_texte est optionnel et sert uniquement de label informatif.
        Les permissions sont assignées directement au membre, pas basées sur le role.
        """
        return InvitationService._inviter_membre(
            nom=nom,
            email=email,
            structure=structure,
            role_utilisateur=RoleUtilisateur.GESTIONNAIRE,  # Par défaut pour le système
            role_equipe=role_texte,  # Texte libre ou None
        )

    @staticmethod
    def _inviter_membre(*, nom, email, structure, role_utilisateur, role_equipe):
        email = email.lower().strip()
        nom = nom.strip()

        if not nom:
            raise ValueError("Nom du collaborateur requis.")
        if Utilisateur.objects.filter(email=email).exists():
            raise ValueError("Un utilisateur existe deja avec cet email.")

        utilisateur = Utilisateur.objects.create(
            nom=nom,
            email=email,
            role=role_utilisateur,
            type_authentification=TypeAuthentification.EMAIL,
            is_active=False,
            email_verifie=False,
        )
        utilisateur.set_unusable_password()
        utilisateur.save()

        EquipeStructure.objects.create(
            structure=structure,
            utilisateur=utilisateur,
            role=role_equipe,
            statut=StatutEquipeStructure.INVITE,
        )

        # Gestionnaires et caissiers : aucun email ni OTP. Ils créent leur
        # compte directement sur la page d'inscription avec leur email.
        return utilisateur

    @staticmethod
    @transaction.atomic
    def valider_otp(*, email, code):
        email = email.lower().strip()
        is_valid = VerificationService.check(email=email, code=code)

        if not is_valid:
            raise ValueError("Code invalide ou expire.")

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
            raise ValueError("Session OTP expiree. Validez a nouveau votre code.")

        utilisateur = Utilisateur.objects.filter(email=email).first()
        if not utilisateur or utilisateur.role not in {
            RoleUtilisateur.PROPRIETAIRE,
            RoleUtilisateur.GESTIONNAIRE,
            RoleUtilisateur.CAISSIER,
        }:
            raise ValueError("Utilisateur invite introuvable.")

        utilisateur.set_password(password)
        utilisateur.is_active = True
        utilisateur.email_verifie = True
        utilisateur.save(update_fields=["password", "is_active", "email_verifie"])

        EquipeStructure.objects.filter(
            utilisateur=utilisateur,
            statut=StatutEquipeStructure.INVITE,
        ).update(
            statut=StatutEquipeStructure.ACTIF,
            date_activation=timezone.now(),
        )

        return utilisateur
