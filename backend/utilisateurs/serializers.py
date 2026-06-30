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
            "date_joined",
        ]
        read_only_fields = fields

class RegisterSerializer(serializers.Serializer):
    nom = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

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