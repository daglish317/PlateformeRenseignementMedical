from rest_framework import serializers
from django.utils import timezone

from structures.models import EquipeStructure, StatutEquipeStructure
from structures.permissions import get_user_structure
from .models import Utilisateur
from .models import RoleUtilisateur, TypeAuthentification
from .services.auth_service import AuthService


class UtilisateurSerializer(serializers.ModelSerializer):
    active_structure = serializers.SerializerMethodField()

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
            "active_structure",
        ]
        read_only_fields = fields

    def get_active_structure(self, obj):
        structure = get_user_structure(obj)
        if not structure:
            return None
        return {
            "id": str(structure.id),
            "nom": structure.nom,
            "type": structure.type,
        }


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
        utilisateur = Utilisateur.objects.filter(email=email).first()
        if utilisateur:
            est_membre_structure_en_attente = (
                utilisateur.role in {
                    RoleUtilisateur.GESTIONNAIRE,
                    RoleUtilisateur.CAISSIER,
                }
                and utilisateur.is_active is False
                and utilisateur.email_verifie is False
                and EquipeStructure.objects.filter(
                    utilisateur=utilisateur,
                    statut=StatutEquipeStructure.INVITE,
                ).exists()
            )
            if not est_membre_structure_en_attente:
                raise serializers.ValidationError("Cette adresse email est d\u00e9j\u00e0 utilis\u00e9e.")
        return email

    def validate_nom(self, value):
        return value.strip()

    def create(self, validated_data):
        utilisateur = Utilisateur.objects.filter(
            email=validated_data["email"],
            role__in=[
                RoleUtilisateur.GESTIONNAIRE,
                RoleUtilisateur.CAISSIER,
            ],
            is_active=False,
            email_verifie=False,
        ).first()

        if utilisateur and EquipeStructure.objects.filter(
            utilisateur=utilisateur,
            statut=StatutEquipeStructure.INVITE,
        ).exists():
            utilisateur.nom = validated_data["nom"]
            utilisateur.set_password(validated_data["password"])
            utilisateur.type_authentification = TypeAuthentification.EMAIL
            utilisateur.is_active = True
            utilisateur.email_verifie = True
            utilisateur.save(
                update_fields=[
                    "nom",
                    "password",
                    "type_authentification",
                    "is_active",
                    "email_verifie",
                ]
            )
            EquipeStructure.objects.filter(
                utilisateur=utilisateur,
                statut=StatutEquipeStructure.INVITE,
            ).update(
                statut=StatutEquipeStructure.ACTIF,
                date_activation=timezone.now(),
            )
            return utilisateur

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
    nom = serializers.CharField(required=False, allow_blank=True, max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
