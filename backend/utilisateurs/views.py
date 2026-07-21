from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    UtilisateurSerializer,
    UtilisateurUpdateSerializer,
    InviteGestionnaireSerializer,
    ValidateOtpSerializer,
    SetPasswordSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
    LogoutSerializer,
)
from .services.auth_service import AuthService
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
from .permissions import IsAdmin
from .decorators import admin_required
from core.verification.service import VerificationService
from core.utils.rate_limit import RateLimiter


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

        user = AuthService.login_google(
            google_token=serializer.validated_data["id_token"],
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
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
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
            gestionnaire = InvitationService.inviter_gestionnaire(
                nom=serializer.validated_data["nom"],
                email=serializer.validated_data["email"],
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(
            {
                "message": "Invitation envoyée",
                "data": UtilisateurSerializer(gestionnaire).data,
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
