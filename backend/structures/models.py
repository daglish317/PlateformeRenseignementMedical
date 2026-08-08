import uuid

from django.db import models
from django.utils import timezone


class TypeStructure(models.TextChoices):
    HOPITAL = "HOPITAL", "Hôpital"
    PHARMACIE = "PHARMACIE", "Pharmacie"


class StatutStructure(models.TextChoices):
    EN_ATTENTE = "EN_ATTENTE", "En attente"
    ACTIVE = "ACTIVE", "Active"
    REFUSEE = "REFUSEE", "Refusée"


class RoleEquipeStructure(models.TextChoices):
    PROPRIETAIRE = "PROPRIETAIRE", "Proprietaire"
    GESTIONNAIRE = "GESTIONNAIRE", "Gestionnaire"
    CAISSIER = "CAISSIER", "Caissier"


class StatutEquipeStructure(models.TextChoices):
    INVITE = "INVITE", "Invite"
    ACTIF = "ACTIF", "Actif"
    SUSPENDU = "SUSPENDU", "Suspendu"


class Structure(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    nom = models.CharField(
        max_length=255,
        db_index=True,
    )

    type = models.CharField(
        max_length=20,
        choices=TypeStructure.choices,
        db_index=True,
    )

    photo = models.ImageField(
        upload_to="structures/photos/",
        null=True,
        blank=True,
    )

    adresse = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    telephone = models.CharField(
        max_length=30,
        db_index=True,
        blank=True,
        default="",
    )

    latitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
    )

    statut = models.CharField(
        max_length=20,
        choices=StatutStructure.choices,
        default=StatutStructure.EN_ATTENTE,
        db_index=True,
    )

    gestionnaire = models.OneToOneField(
        "utilisateurs.Utilisateur",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="structure",
    )

    date_creation = models.DateTimeField(
        auto_now_add=True,
    )

    date_validation = models.DateTimeField(
        null=True,
        blank=True,
    )
    motif_refus = models.TextField(
        blank=True,
        default=""
    )

    valide_par = models.ForeignKey(
    "utilisateurs.Utilisateur",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="structures_validees"
    )

    est_supprimee = models.BooleanField(
        default=False,
        db_index=True,
    )

    class Meta:
        verbose_name = "Structure"
        verbose_name_plural = "Structures"
        ordering = ["-date_creation"]
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
        ]

    def valider(self):
        self.statut = StatutStructure.ACTIVE
        self.date_validation = timezone.now()
        self.save(update_fields=["statut", "date_validation"])

    def refuser(self):
        self.statut = StatutStructure.REFUSEE
        self.date_validation = timezone.now()
        self.save(update_fields=["statut", "date_validation"])
    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"


class EquipeStructure(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        Structure,
        on_delete=models.CASCADE,
        related_name="equipe",
    )

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="structures_membres",
    )

    role = models.CharField(
        max_length=20,
        choices=RoleEquipeStructure.choices,
        db_index=True,
    )

    statut = models.CharField(
        max_length=20,
        choices=StatutEquipeStructure.choices,
        default=StatutEquipeStructure.INVITE,
        db_index=True,
    )

    date_invitation = models.DateTimeField(auto_now_add=True)
    date_activation = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Membre de structure"
        verbose_name_plural = "Equipe des structures"
        ordering = ["structure__nom", "role", "utilisateur__nom"]
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "utilisateur"],
                name="unique_equipe_structure_utilisateur",
            )
        ]
        indexes = [
            models.Index(fields=["structure", "role"]),
            models.Index(fields=["utilisateur", "statut"]),
        ]

    def activer(self):
        self.statut = StatutEquipeStructure.ACTIF
        self.date_activation = timezone.now()
        self.save(update_fields=["statut", "date_activation"])

    def __str__(self):
        return f"{self.utilisateur} - {self.structure} ({self.role})"


class TypeService(models.TextChoices):
    MALADIE = "MALADIE", "Maladie"
    ANALYSE = "ANALYSE", "Analyse"
    EXAMEN = "EXAMEN", "Examen"
    SERVICE_MEDICAL = "SERVICE_MEDICAL", "Service médical"


class StructureService(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=30, choices=TypeService.choices, db_index=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=255, blank=True)
    categorie = models.CharField(max_length=100, blank=True)
    est_actif = models.BooleanField(default=True, db_index=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ["type", "nom"]
        constraints = [
            models.UniqueConstraint(fields=["nom", "type"], name="unique_nom_type_service")
        ]
        indexes = [
            models.Index(fields=["type", "nom"]),
            models.Index(fields=["est_actif"]),
        ]

    def save(self, *args, **kwargs):
        self.nom = self.nom.strip()
        if not self.slug:
            from django.utils.text import slugify
            base = slugify(f"{self.nom}-{self.type}")
            self.slug = base
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"


class Favori(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="favoris",
    )

    structure = models.ForeignKey(
        Structure,
        on_delete=models.CASCADE,
        related_name="favoris",
    )

    date_ajout = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["utilisateur", "structure"],
                name="unique_favori_utilisateur_structure",
            )
        ]
        ordering = ["-date_ajout"]

    def __str__(self):
        return f"Favori: {self.utilisateur.nom} → {self.structure.nom}"


class JourSemaine(models.TextChoices):
    LUNDI = "LUNDI", "Lundi"
    MARDI = "MARDI", "Mardi"
    MERCREDI = "MERCREDI", "Mercredi"
    JEUDI = "JEUDI", "Jeudi"
    VENDREDI = "VENDREDI", "Vendredi"
    SAMEDI = "SAMEDI", "Samedi"
    DIMANCHE = "DIMANCHE", "Dimanche"


class Horaire(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    structure = models.ForeignKey(
        Structure,
        on_delete=models.CASCADE,
        related_name="horaires",
    )

    jour = models.CharField(
        max_length=10,
        choices=JourSemaine.choices,
    )

    heure_ouverture = models.TimeField()

    heure_fermeture = models.TimeField()

    est_ferme = models.BooleanField(
        default=False,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "jour"],
                name="unique_horaire_structure_jour",
            )
        ]
        ordering = ["jour"]

    def __str__(self):
        if self.est_ferme:
            return f"{self.structure.nom} - {self.jour}: Fermé"
        return f"{self.structure.nom} - {self.jour}: {self.heure_ouverture} - {self.heure_fermeture}"
