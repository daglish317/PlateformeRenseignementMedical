from django.db import transaction

from .models import Catalogue


class CatalogueService:
    """
    Toute la logique métier du catalogue.
    """

    @staticmethod
    @transaction.atomic
    def creer(*, donnees):
        """
        Création d'une nouvelle entrée du catalogue.
        """

        return Catalogue.objects.create(**donnees)

    @staticmethod
    @transaction.atomic
    def modifier(*, catalogue, donnees):
        """
        Modification d'une entrée existante.
        """

        for champ, valeur in donnees.items():
            setattr(catalogue, champ, valeur)

        catalogue.save()

        return catalogue

    @staticmethod
    @transaction.atomic
    def supprimer(*, catalogue):
        """
        Suppression définitive d'une entrée du catalogue.
        """
        catalogue.delete()

    @staticmethod
    @transaction.atomic
    def activer(catalogue):
        """
        Réactive une entrée du catalogue.
        """

        if not catalogue.est_actif:
            catalogue.est_actif = True
            catalogue.save(update_fields=["est_actif"])

        return catalogue

    @staticmethod
    @transaction.atomic
    def desactiver(catalogue):
        """
        Désactive une entrée sans la supprimer.
        """

        if catalogue.est_actif:
            catalogue.est_actif = False
            catalogue.save(update_fields=["est_actif"])

        return catalogue

    @staticmethod
    def obtenir_par_id(catalogue_id):
        """
        Retourne une entrée par son identifiant.
        """

        return Catalogue.objects.filter(
            id=catalogue_id
        ).first()

    @staticmethod
    def obtenir_par_nom(nom, type_catalogue):
        """
        Recherche par nom (insensible à la casse).
        """

        return Catalogue.objects.filter(
            nom__iexact=nom.strip(),
            type=type_catalogue,
        ).first()

    @staticmethod
    def lister(*, request):

        queryset = Catalogue.objects.all()

        type_catalogue = request.query_params.get("type")
        nom = request.query_params.get("nom")
        est_actif = request.query_params.get("est_actif")

        if type_catalogue:
          queryset = queryset.filter(type=type_catalogue)

        if nom:
          queryset = queryset.filter(
             nom__icontains=nom
        )

        if est_actif is not None:

          valeur = est_actif.lower() == "true"

          queryset = queryset.filter(
              est_actif=valeur
        )

        return queryset.order_by(
          "type",
          "nom",
        )