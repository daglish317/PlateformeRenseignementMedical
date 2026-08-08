from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.utils import timezone

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    UtilisateurSerializer,
    UtilisateurUpdateSerializer,
    InviteGestionnaireSerializer,
    ValidateOtpSerializer,
    SetPasswordSerializer,
    CheckGestionnaireSerializer,
    ActivateGestionnaireSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
    LogoutSerializer,
)
from .services.auth_service import AuthService
from .services.google_service import GoogleAuthError
from core.verification.session import VerificationSession
from .views_admin import (
    RegisterAdminView,
    AdminDashboardView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminManagersListView,
    AdminManagerDetailView,
    AdminStatisticsView,
)
from .services.invitation_service import InvitationService
from structures.models import EquipeStructure, StatutEquipeStructure
from .permissions import IsAdmin
from .decorators import admin_required
from core.verification.service import VerificationService
from core.verification.session import VerificationSession
from core.utils.rate_limit import RateLimiter
from utilisateurs.models import Utilisateur, RoleUtilisateur


def _user_response(user):
    return {
        "user": UtilisateurSerializer(user).data,
        "tokens": AuthService.get_tokens_for_user(user),
    }


class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(_user_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        if not RateLimiter.is_allowed(f"login:{email}", 10, 900):
            return Response(
                {"detail": "Trop de tentatives. Réessayez plus tard."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        user = AuthService.login_email(
            email=email,
            password=serializer.validated_data["password"],
        )
        if not user:
            return Response(
                {"detail": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        RateLimiter.reset(f"login:{email}")
        return Response(_user_response(user))


class GoogleAuthView(APIView):

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = AuthService.login_google(
                google_token=serializer.validated_data["id_token"],
            )
        except GoogleAuthError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user:
            return Response(
                {"detail": "Token Google invalide"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(_user_response(user))


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"])
        except TokenError:
            return Response({"detail": "Token invalide"}, status=400)
        return Response({"message": "Déconnexion réussie"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UtilisateurSerializer(request.user).data)

    def patch(self, request):
        serializer = UtilisateurUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UtilisateurSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["old_password"]):
            return Response({"detail": "Ancien mot de passe incorrect"}, status=400)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Mot de passe modifié"})


class ForgotPasswordView(APIView):

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email requis"}, status=400)
        try:
            VerificationService.generate(email)
        except ValueError as e:
            return Response({"detail": str(e)}, status=429)
        return Response({"message": "Code envoyé par email"})


class ResetPasswordView(APIView):

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not VerificationService.check(data["email"], data["code"]):
            return Response({"detail": "Code invalide ou expiré"}, status=400)
        from utilisateurs.models import Utilisateur
        user = Utilisateur.objects.filter(email=data["email"].lower()).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable"}, status=404)
        user.set_password(data["new_password"])
        user.save()
        return Response({"message": "Mot de passe réinitialisé"})


class InviteGestionnaireView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = InviteGestionnaireSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            proprietaire = InvitationService.inviter_proprietaire(
                nom=serializer.validated_data["nom"],
                email=serializer.validated_data["email"],
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(
            {
                "message": "Invitation envoyée",
                "data": UtilisateurSerializer(proprietaire).data,
            },
            status=201,
        )


class ValidateGestionnaireOtpView(APIView):

    def post(self, request):
        serializer = ValidateOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            InvitationService.valider_otp(
                email=serializer.validated_data["email"],
                code=serializer.validated_data["code"],
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response({"message": "Code validé. Définissez votre mot de passe."})


class SetGestionnairePasswordView(APIView):

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = InvitationService.definir_mot_de_passe(
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(_user_response(user), status=200)


class CheckGestionnaireView(APIView):

    def post(self, request):
        serializer = CheckGestionnaireSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        user = Utilisateur.objects.filter(email=email).first()
        is_pending = (
            user is not None
            and user.role in {
                RoleUtilisateur.PROPRIETAIRE,
                RoleUtilisateur.GESTIONNAIRE,
                RoleUtilisateur.CAISSIER,
            }
            and user.is_active is False
            and user.email_verifie is False
        )
        # Le propriétaire (invité par l'admin) garde le flux email + OTP.
        # Le gestionnaire/caissier crée son compte directement (pas d'OTP).
        requires_otp = is_pending and user.role == RoleUtilisateur.PROPRIETAIRE
        return Response({
            "is_invited": is_pending,
            "is_gestionnaire": is_pending,
            "is_invited_structure_user": is_pending,
            "requires_otp": requires_otp,
            "role": user.role if is_pending else None,
        })


class ActivateGestionnaireView(APIView):

    def post(self, request):
        serializer = ActivateGestionnaireSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]
        nom = serializer.validated_data.get("nom", "").strip()

        user = Utilisateur.objects.filter(email=email).first()
        if not user or user.role not in {
            RoleUtilisateur.PROPRIETAIRE,
            RoleUtilisateur.GESTIONNAIRE,
            RoleUtilisateur.CAISSIER,
        }:
            return Response({"detail": "Utilisateur introuvable."}, status=404)

        if user.is_active:
            return Response({"detail": "Ce compte est déjà activé."}, status=400)

        # Seul le propriétaire (invité par l'admin) doit valider un code OTP
        # avant l'activation. Le gestionnaire/caissier crée son compte avec
        # son email seul (pas d'email envoyé par le propriétaire).
        if user.role == RoleUtilisateur.PROPRIETAIRE:
            session = VerificationSession.objects.filter(
                email=email,
                is_verified=True,
                expires_at__gt=timezone.now(),
            ).first()

            if not session:
                return Response({"detail": "Session expirée. Validez à nouveau votre code OTP."}, status=400)

        user.set_password(password)
        if nom:
            user.nom = nom
        user.is_active = True
        user.email_verifie = True
        user.save(update_fields=["password", "nom", "is_active", "email_verifie"])
        EquipeStructure.objects.filter(
            utilisateur=user,
            statut=StatutEquipeStructure.INVITE,
        ).update(
            statut=StatutEquipeStructure.ACTIF,
            date_activation=timezone.now(),
        )

        return Response(_user_response(user), status=200)
