from rest_framework import serializers

from .models import Utilisateur
from .services.auth_service import AuthService


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "nom",
            "email",
            "role",
            "type_authentification",
            "email_verifie",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = fields


class UtilisateurUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ["nom"]


class RegisterSerializer(serializers.Serializer):
    nom = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        email = value.lower().strip()
        if Utilisateur.objects.filter(email=email).exists():
            raise serializers.ValidationError("Cette adresse email est d\u00e9j\u00e0 utilis\u00e9e.")
        return email

    def validate_nom(self, value):
        return value.strip()

    def create(self, validated_data):
        return AuthService.register_patient(
            nom=validated_data["nom"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class InviteGestionnaireSerializer(serializers.Serializer):
    nom = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Le nom est trop court.")
        return value

    def validate_email(self, value):
        value = value.lower().strip()
        if Utilisateur.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value


class ValidateOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=4)


class SetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=4)
    new_password = serializers.CharField(write_only=True, min_length=8)


class CheckGestionnaireSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ActivateGestionnaireSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
