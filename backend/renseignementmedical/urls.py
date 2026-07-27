from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/utilisateurs/", include("utilisateurs.urls")),
    path("api/structures/", include("structures.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/prises-en-charge/", include("prise_en_charge.urls")),
    path("api/plateau-technique/", include("plateau_technique.urls")),
    path("api/stocks/", include("stock.urls")),
    path("api/catalogues/", include("catalogues.urls")),
    path("api/search/", include("search.urls")),
    path("api/feedback/", include("feedback.urls")),
    path("api/service-medical/", include("service_medical.urls")),
    path("api/analyses/", include("analyses.urls")),
    path("api/messagerie/", include("messagerie.urls")),
    path("api/core/", include("core.urls")),
]
