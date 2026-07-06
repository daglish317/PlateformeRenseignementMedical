from django.db import transaction

from .models import AvisStructure, CommentaireAvis


class AvisService:

    # =========================
    # CREER AVIS (NOTE FIXE)
    # =========================
    @staticmethod
    @transaction.atomic
    def creer_ou_get_avis(*, utilisateur, structure, note):

        avis, created = AvisStructure.objects.get_or_create(
            utilisateur=utilisateur,
            structure=structure,
            defaults={"note": note}
        )

        return avis

    # =========================
    # AJOUT COMMENTAIRE
    # =========================
    @staticmethod
    @transaction.atomic
    def ajouter_commentaire(*, avis, contenu):

        return CommentaireAvis.objects.create(
            avis=avis,
            contenu=contenu
        )

    # =========================
    # MODIFIER COMMENTAIRE
    # =========================
    @staticmethod
    @transaction.atomic
    def modifier_commentaire(*, commentaire, contenu):

        commentaire.contenu = contenu
        commentaire.save(update_fields=["contenu"])

        return commentaire

    # =========================
    # SUPPRIMER COMMENTAIRE
    # =========================
    @staticmethod
    @transaction.atomic
    def supprimer_commentaire(*, commentaire):

        commentaire.delete()