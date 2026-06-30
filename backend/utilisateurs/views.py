from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer
)

from .services.auth_service import AuthService


# =========================
# REGISTER PATIENT
# =========================
class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            tokens = AuthService.get_tokens_for_user(user)

            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "nom": user.nom,
                },
                "tokens": tokens
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# LOGIN EMAIL
# =========================
class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = AuthService.login_email(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"]
        )

        if not user:
            return Response(
                {"detail": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = AuthService.get_tokens_for_user(user)

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "nom": user.nom,
            },
            "tokens": tokens
        })


# =========================
# GOOGLE LOGIN
# =========================
class GoogleAuthView(APIView):

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = AuthService.login_google(
            google_token=serializer.validated_data["id_token"]
        )

        if not user:
            return Response(
                {"detail": "Token Google invalide"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = AuthService.get_tokens_for_user(user)

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "nom": user.nom,
            },
            "tokens": tokens
        })
