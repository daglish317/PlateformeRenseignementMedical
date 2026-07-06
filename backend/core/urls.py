from django.urls import path, include

from core.verification.urls import urlpatterns as verification_urls
from core.views import CatalogueImportView

urlpatterns = [
    path("verification/", include(verification_urls)),
    path("import/catalogue/", CatalogueImportView.as_view()),
]
