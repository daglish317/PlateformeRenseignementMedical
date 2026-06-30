from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from utilisateurs.models import Utilisateur, RoleUtilisateur, TypeAuthentification
from .google_service import GoogleAuthService


class AuthService:

    # =========================
    # JWT GENERATION
    # =========================
    @staticmethod
    def get_tokens_for_user(user: Utilisateur):
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    # =========================
    # REGISTER EMAIL
    # =========================
    @staticmethod
    def register_patient(nom: str, email: str, password: str):

        user = Utilisateur.objects.create_user(
            nom=nom,
            email=email,
            password=password,
            role=RoleUtilisateur.PATIENT,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=False,
        )

        return user

    # =========================
    # LOGIN EMAIL
    # =========================
    @staticmethod
    def login_email(email: str, password: str):

        user = authenticate(email=email, password=password)

        if not user:
            return None

        return user

    # =========================
    # GOOGLE LOGIN / REGISTER
    # =========================
    @staticmethod
    def login_google(google_token: str):

        data = GoogleAuthService.verify_google_token(google_token)

        if not data:
            return None

        email = data["email"]

        user = Utilisateur.objects.filter(email=email).first()

        # CREATE USER IF NOT EXISTS
        if not user:
            user = Utilisateur.objects.create_user(
                nom=data["nom"],
                email=email,
                password=None,
                role=RoleUtilisateur.PATIENT,
                type_authentification=TypeAuthentification.GOOGLE,
                email_verifie=data["email_verified"],
            )
        else:
            # update verification
            user.email_verifie = True
            user.type_authentification = TypeAuthentification.GOOGLE
            user.save()

        return user