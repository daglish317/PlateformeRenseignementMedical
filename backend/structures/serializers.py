from rest_framework import serializers
from .models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    StructureService,
    Favori,
    Horaire,
)


class StructureCreateSerializer(serializers.ModelSerializer):
    """
    Création structure (gestionnaire)
    """

    class Meta:
        model = Structure
        fields = [
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
        ]
        extra_kwargs = {
            "photo": {"required": False, "allow_null": True},
            "latitude": {"required": True},
            "longitude": {"required": True},
        }

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Nom trop court")
        return value

    def validate_telephone(self, value):
        value = value.strip()
        if len(value) < 8:
            raise serializers.ValidationError("Numéro invalide")
        return value


class StructureListSerializer(serializers.ModelSerializer):
    """
    Affichage en cartes (liste frontend)
    """

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
        ]


class StructureAdminListSerializer(serializers.ModelSerializer):
    proprietaire_nom = serializers.SerializerMethodField()
    proprietaire_email = serializers.SerializerMethodField()
    gestionnaire_nom = serializers.SerializerMethodField()
    gestionnaire_email = serializers.SerializerMethodField()

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "statut",
            "motif_refus",
            "proprietaire_nom",
            "proprietaire_email",
            "gestionnaire_nom",
            "gestionnaire_email",
            "date_creation",
            "latitude",
            "longitude",
        ]

    def _members(self, obj):
        """Membres par rôle, réutilise le prefetch `equipe__utilisateur`."""
        cache = getattr(self, "_members_cache", None)
        if cache is None:
            cache = self._members_cache = {}
        members = cache.get(obj.pk)
        if members is None:
            members = {m.role: m for m in obj.equipe.all()}
            cache[obj.pk] = members
        return members

    def get_proprietaire_nom(self, obj):
        member = self._members(obj).get(RoleEquipeStructure.PROPRIETAIRE)
        return member.utilisateur.nom if member else ""

    def get_proprietaire_email(self, obj):
        member = self._members(obj).get(RoleEquipeStructure.PROPRIETAIRE)
        return member.utilisateur.email if member else ""

    def get_gestionnaire_nom(self, obj):
        member = self._members(obj).get(RoleEquipeStructure.GESTIONNAIRE)
        if member:
            return member.utilisateur.nom
        return obj.gestionnaire.nom if obj.gestionnaire else ""

    def get_gestionnaire_email(self, obj):
        member = self._members(obj).get(RoleEquipeStructure.GESTIONNAIRE)
        if member:
            return member.utilisateur.email
        return obj.gestionnaire.email if obj.gestionnaire else ""


class StructureDetailSerializer(serializers.ModelSerializer):
    """
    Détail complet structure
    """

    gestionnaire = serializers.StringRelatedField()
    proprietaire = serializers.SerializerMethodField()

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
            "statut",
            "proprietaire",
            "gestionnaire",
            "motif_refus",
            "valide_par",
            "date_creation",
            "date_validation",
        ]

    def get_proprietaire(self, obj):
        member = (
            EquipeStructure.objects.filter(
                structure=obj,
                role=RoleEquipeStructure.PROPRIETAIRE,
            )
            .select_related("utilisateur")
            .first()
        )
        if not member:
            return None
        return {
            "id": str(member.utilisateur_id),
            "nom": member.utilisateur.nom,
            "email": member.utilisateur.email,
        }


class StructureValidationSerializer(serializers.Serializer):

    action = serializers.ChoiceField(
        choices=[
            ("APPROVE", "APPROVE"),
            ("REJECT", "REJECT"),
        ]
    )

    motif = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, attrs):

        if attrs["action"] == "REJECT":

            if not attrs.get("motif"):
                raise serializers.ValidationError(
                    {
                        "motif": "Le motif est obligatoire."
                    }
                )

        return attrs


class FavoriCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()


class FavoriSerializer(serializers.ModelSerializer):

    structure = StructureListSerializer(read_only=True)

    class Meta:
        model = Favori
        fields = [
            "id",
            "structure",
            "date_ajout",
        ]


class HoraireSerializer(serializers.ModelSerializer):

    class Meta:
        model = Horaire
        fields = [
            "id",
            "jour",
            "heure_ouverture",
            "heure_fermeture",
            "est_ferme",
        ]


class HoraireBulkCreateSerializer(serializers.Serializer):

    horaires = HoraireSerializer(many=True)

    def validate_horaires(self, value):
        jours_vus = set()
        for h in value:
            jour = h.get("jour")
            if jour in jours_vus:
                raise serializers.ValidationError(f"Le jour {jour} est duplicé.")
            jours_vus.add(jour)

            if not h.get("est_ferme", False):
                ouverture = h.get("heure_ouverture")
                fermeture = h.get("heure_fermeture")
                if ouverture and fermeture and ouverture >= fermeture:
                    raise serializers.ValidationError(
                        f"Pour {jour}: l'heure d'ouverture doit être avant l'heure de fermeture."
                    )
        return value


class StructureMapSerializer(serializers.ModelSerializer):

    class Meta:
        model = Structure

        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "latitude",
            "longitude",
        ]



class StructurePublicMapSerializer(serializers.ModelSerializer):
    """
    Données publiques utilisées par la carte et les résultats de recherche.
    """

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
        ]


class StructureServiceSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = StructureService
        fields = [
            "id",
            "nom",
            "type",
            "type_display",
            "description",
            "slug",
            "categorie",
            "est_actif",
            "date_creation",
            "date_modification",
        ]
        read_only_fields = ["id", "slug", "date_creation", "date_modification"]


class StructureServiceCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = StructureService
        fields = ["nom", "type", "description", "categorie", "est_actif"]

    def validate_nom(self, value):
        value = " ".join(value.strip().split())
        if len(value) < 2:
            raise serializers.ValidationError("Le nom est trop court.")
        return value

    def validate(self, attrs):
        nom = attrs["nom"]
        type_svc = attrs["type"]
        queryset = StructureService.objects.filter(nom__iexact=nom, type=type_svc)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({"nom": "Un service portant ce nom existe déjà pour ce type."})
        return attrs


class EquipeStructureSerializer(serializers.ModelSerializer):
    utilisateur_id = serializers.UUIDField(source="utilisateur.id", read_only=True)
    nom = serializers.CharField(source="utilisateur.nom", read_only=True)
    email = serializers.EmailField(source="utilisateur.email", read_only=True)
    is_active = serializers.BooleanField(source="utilisateur.is_active", read_only=True)

    class Meta:
        model = EquipeStructure
        fields = [
            "id",
            "utilisateur_id",
            "nom",
            "email",
            "role",
            "statut",
            "is_active",
            "date_invitation",
            "date_activation",
        ]


class InviteStructureMemberSerializer(serializers.Serializer):
    structure_id = serializers.UUIDField()
    nom = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=[
            RoleEquipeStructure.GESTIONNAIRE,
            RoleEquipeStructure.CAISSIER,
        ]
    )

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Le nom est trop court.")
        return value

    def validate_email(self, value):
        return value.lower().strip()


class UpdateStructureMemberStatusSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[
            ("ACTIVATE", "ACTIVATE"),
            ("DEACTIVATE", "DEACTIVATE"),
        ]
    )


class ProprietaireStructureCreateSerializer(serializers.Serializer):
    nom = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(choices=["HOPITAL", "PHARMACIE"])
    adresse = serializers.CharField(max_length=255, required=False, allow_blank=True)
    telephone = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Le nom de la structure est trop court.")
        return value

    def validate_adresse(self, value):
        return value.strip()

    def validate_telephone(self, value):
        return value.strip()


class MemberPermissionsUpdateSerializer(serializers.Serializer):
    permissions = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField()),
    )

    def validate_permissions(self, value):
        from structures.permission_service import validate_permissions_payload

        return validate_permissions_payload(value)

