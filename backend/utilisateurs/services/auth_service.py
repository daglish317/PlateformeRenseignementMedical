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
        normalized_email = email.lower().strip()
        user = Utilisateur.objects.filter(email=normalized_email).first()

        if not user:
            return None

        if not user.is_active:
            return None

        if not user.check_password(password):
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

        email = data["email"].lower().strip()

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
            update_fields = []

            if not user.email_verifie:
                user.email_verifie = True
                update_fields.append("email_verifie")

            if user.type_authentification != TypeAuthentification.GOOGLE:
                user.type_authentification = TypeAuthentification.GOOGLE
                update_fields.append("type_authentification")

            if update_fields:
                user.save(update_fields=update_fields)

        return user
