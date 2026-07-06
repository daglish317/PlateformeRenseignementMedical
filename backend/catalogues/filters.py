import django_filters

from .models import Catalogue


class CatalogueFilter(django_filters.FilterSet):

    nom = django_filters.CharFilter(
        field_name="nom",
        lookup_expr="icontains",
    )

    type = django_filters.CharFilter()

    est_actif = django_filters.BooleanFilter()

    class Meta:
        model = Catalogue

        fields = [
            "nom",
            "type",
            "est_actif",
        ]