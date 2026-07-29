from django.urls import path

from .services_views import (
    ServiceListView,
    ServiceDetailView,
    ServiceCreateView,
    ServiceUpdateView,
    ServiceDeleteView,
)

urlpatterns = [
    path("", ServiceListView.as_view(), name="service-list"),
    path("<uuid:pk>/", ServiceDetailView.as_view(), name="service-detail"),
    path("create/", ServiceCreateView.as_view(), name="service-create"),
    path("update/<uuid:pk>/", ServiceUpdateView.as_view(), name="service-update"),
    path("delete/<uuid:pk>/", ServiceDeleteView.as_view(), name="service-delete"),
]
