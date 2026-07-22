from django.urls import path, include
from django.conf import settings

from core.verification.urls import urlpatterns as verification_urls
from core.views import CatalogueImportView

urlpatterns = [
    path("verification/", include(verification_urls)),
    path("import/catalogue/", CatalogueImportView.as_view()),
]

if settings.DEBUG:
    from core.views_dev import DevOtpickerView
    urlpatterns += [
        path("dev/otp/", DevOtpickerView.as_view(), name="dev-otp"),
    ]
