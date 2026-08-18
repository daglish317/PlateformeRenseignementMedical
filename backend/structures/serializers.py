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


class PublicStructureDetailSerializer(serializers.ModelSerializer):
    """
    Fiche publique d'une structure (spec moteurRecherche.md §27-30).

    N'expose que les données publiques : ni prix, ni fournisseurs, ni
    approvisionnements, ni informations de gestion internes.
    Les horaires affichés sont exactement ceux utilisés par le moteur (§28).
    """

    est_ouverte = serializers.SerializerMethodField()
    horaires = serializers.SerializerMethodField()
    produits = serializers.SerializerMethodField()
    produits_total = serializers.SerializerMethodField()

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
            "est_ouverte",
            "horaires",
            "produits",
            "produits_total",
        ]

    def get_est_ouverte(self, obj):
        from .services import HoraireService

        return HoraireService.est_ouverte(obj)

    def get_horaires(self, obj):
        from .models import JourSemaine

        jours = [c[0] for c in JourSemaine.choices]
        par_jour = {}
        for h in obj.horaires.all():
            par_jour.setdefault(h.jour, []).append(h)

        resultat = []
        for jour in jours:
            entrees = sorted(
                par_jour.get(jour, []),
                key=lambda h: (h.position, h.heure_ouverture),
            )
            plages = [
                {
                    "ouverture": h.heure_ouverture.strftime("%H:%M"),
                    "fermeture": h.heure_fermeture.strftime("%H:%M"),
                }
                for h in entrees
                if not h.est_ferme
            ]
            resultat.append(
                {
                    "jour": jour,
                    "plages": plages,
                    "est_ferme": not plages,
                }
            )
        return resultat

    def get_produits(self, obj):
        if obj.type != "PHARMACIE":
            return []
        from stock.services import StockService

        items = StockService.produits_publics(obj).order_by("nom")[:20]
        return [
            {"id": str(i.id), "nom": i.nom, "quantite": i.stock_disponible}
            for i in items
        ]

    def get_produits_total(self, obj):
        if obj.type != "PHARMACIE":
            return 0
        from stock.services import StockService

        return StockService.produits_publics(obj).count()


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


class UpdateStructureStatusSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[
            ("ACTIVATE", "ACTIVATE"),
            ("DEACTIVATE", "DEACTIVATE"),
        ]
    )


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
            "position",
        ]


class HoraireBulkCreateSerializer(serializers.Serializer):
    """Enregistre toutes les périodes de la semaine (plusieurs par jour possibles)."""

    horaires = HoraireSerializer(many=True)

    def validate_horaires(self, value):
        positions_par_jour = {}
        for horaire in value:
            jour = horaire.get("jour")
            if horaire.get("est_ferme", False):
                continue

            ouverture = horaire.get("heure_ouverture")
            fermeture = horaire.get("heure_fermeture")
            if not ouverture or not fermeture:
                raise serializers.ValidationError(
                    f"Pour {jour}: les heures d'ouverture et de fermeture sont obligatoires."
                )

            positions_par_jour.setdefault(jour, 0)
            positions_par_jour[jour] += 1

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
    role = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Le nom est trop court.")
        return value

    def validate_email(self, value):
        return value.lower().strip()

    def validate_role(self, value):
        if value:
            return value.strip()
        return None


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
    latitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        required=True,
    )
    longitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        required=True,
    )

    def validate_nom(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Le nom de la structure est trop court.")
        return value

    def validate_adresse(self, value):
        return value.strip()

    def validate_telephone(self, value):
        return value.strip()

    def validate_latitude(self, value):
        if value is not None and not (-90 <= value <= 90):
            raise serializers.ValidationError("La latitude doit être comprise entre -90 et 90.")
        return value

    def validate_longitude(self, value):
        if value is not None and not (-180 <= value <= 180):
            raise serializers.ValidationError("La longitude doit être comprise entre -180 et 180.")
        return value

    def validate(self, attrs):
        latitude = attrs.get("latitude")
        longitude = attrs.get("longitude")
        if latitude is None or longitude is None:
            raise serializers.ValidationError(
                "La localisation de la structure est obligatoire."
            )
        return attrs


class MemberPermissionsUpdateSerializer(serializers.Serializer):
    permissions = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField()),
    )

    def validate_permissions(self, value):
        from structures.permission_service import validate_permissions_payload

        try:
            return validate_permissions_payload(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc


