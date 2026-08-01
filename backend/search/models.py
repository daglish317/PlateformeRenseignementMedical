import uuid
from django.db import models


class SearchLog(models.Model):
    """Historique des recherches utilisateur (Exigence #10)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=255, db_index=True)
    user_lat = models.DecimalField(
        max_digits=12, decimal_places=8, null=True, blank=True
    )
    user_lon = models.DecimalField(
        max_digits=12, decimal_places=8, null=True, blank=True
    )
    results_count = models.PositiveIntegerField(default=0)
    search_type = models.CharField(max_length=50, blank=True)  # Type détecté
    user = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="search_history"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["query", "-created_at"]),
        ]


class SearchIndex(models.Model):
    """
    Index unifié de recherche en temps réel (Exigences #1, #2, #11, #14)
    Agrège tous les contenus recherchables: stocks, services, structures
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Contenu indexé normalisé (Exigence #5)
    content = models.TextField(db_index=True)  # Texte normalisé
    content_original = models.TextField()  # Texte original
    
    # Métadonnées de classification (Exigence #9, #12)
    search_type = models.CharField(
        max_length=50,
        db_index=True,
        choices=[
            ("MEDICAMENT", "Médicament"),
            ("MALADIE", "Maladie"),
            ("ANALYSE", "Analyse"),
            ("EXAMEN", "Examen"),
            ("SERVICE_MEDICAL", "Service médical"),
            ("EQUIPEMENT", "Équipement"),
            ("PLATEAU_TECHNIQUE", "Plateau technique"),
        ]
    )
    
    # Lien vers l'objet source (Exigence #1 - données réelles)
    content_type = models.CharField(max_length=50)  # stock, service, etc.
    object_id = models.UUIDField()
    
    # Structure associée (Exigence #8 - géolocalisation)
    structure_id = models.UUIDField(db_index=True)
    structure_nom = models.CharField(max_length=255)
    structure_type = models.CharField(max_length=20)
    structure_adresse = models.CharField(max_length=255)
    structure_telephone = models.CharField(max_length=30)
    structure_latitude = models.DecimalField(max_digits=12, decimal_places=8, null=True)
    structure_longitude = models.DecimalField(max_digits=12, decimal_places=8, null=True)
    structure_statut = models.CharField(max_length=20, default="ACTIVE")
    
    # Disponibilité (Exigence #7 - classement multicritère)
    is_available = models.BooleanField(default=True, db_index=True)
    quantity = models.PositiveIntegerField(default=0)  # Pour stocks
    
    # Métadonnées additionnelles (Exigence #13 - résultats riches)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps (Exigence #11 - sync auto)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["search_type", "is_available"]),
            models.Index(fields=["structure_id", "is_available"]),
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["structure_latitude", "structure_longitude"]),
        ]
        
    def __str__(self):
        return f"{self.search_type}: {self.content_original[:50]}"


class SearchSynonym(models.Model):
    """
    Synonymes médicaux pour améliorer la recherche (Exigence #15, #17)
    Ex: "mal de tête" -> "céphalée", "migraine"
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    term = models.CharField(max_length=255, db_index=True, unique=True)
    synonyms = models.JSONField(default=list)  # Liste de synonymes
    category = models.CharField(max_length=50, blank=True)  # maladie, symptome, etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["term"]
        
    def __str__(self):
        return f"{self.term} -> {', '.join(self.synonyms[:3])}"


class IntentPattern(models.Model):
    """
    Patterns d'intentions conversationnelles (Exigence #17)
    Ex: "j'ai mal à" -> recherche symptôme/maladie
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pattern = models.CharField(max_length=255, db_index=True)
    intent_type = models.CharField(
        max_length=50,
        choices=[
            ("SYMPTOM_SEARCH", "Recherche symptôme"),
            ("MEDICATION_SEARCH", "Recherche médicament"),
            ("LOCATION_SEARCH", "Recherche lieu"),
            ("AVAILABILITY_SEARCH", "Recherche disponibilité"),
            ("EMERGENCY", "Urgence"),
        ]
    )
    target_search_type = models.CharField(max_length=50)  # Type de recherche cible
    priority = models.IntegerField(default=0)  # Ordre de traitement
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ["-priority", "pattern"]
        
    def __str__(self):
        return f"{self.pattern} -> {self.intent_type}"
