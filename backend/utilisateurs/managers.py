from django.contrib.auth.base_user import BaseUserManager


class UtilisateurManager(BaseUserManager):
    """
    Manager personnalisé du modèle Utilisateur.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse e-mail est obligatoire.")

        email = self.normalize_email(email)

        utilisateur = self.model(
            email=email,
            **extra_fields
        )

        if password:
            utilisateur.set_password(password)
        else:
            utilisateur.set_unusable_password()

        utilisateur.save(using=self._db)

        return utilisateur

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("role", "ADMINISTRATEUR")
        extra_fields.setdefault("type_authentification", "EMAIL")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Le superutilisateur doit avoir is_staff=True.")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Le superutilisateur doit avoir is_superuser=True.")

        return self.create_user(email, password, **extra_fields)