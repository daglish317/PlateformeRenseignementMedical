from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    CreateStructureView,
    AdminListStructuresView,
    ValidateStructureView,
    StructureDetailView,
    AddFavoriView,
    RemoveFavoriView,
    ListFavorisView,
    CheckFavoriView,
    ListHorairesView,
    SetHorairesView,
    UpdateSingleHoraireView,
    MyStructureView,
    MyStructureTeamView,
    OwnerStructuresView,
    StructureTeamMemberStatusView,
    PermissionRegistryView,
    MyPermissionsView,
    MemberPermissionsView,
)
from .views import StructuresProchesView
from .form import StructureFormSubmitView

urlpatterns = [
    path("me/", MyStructureView.as_view(), name="structure-me"),
    path("me/permissions/", MyPermissionsView.as_view(), name="structure-me-permissions"),
    path("permissions/registry/", PermissionRegistryView.as_view(), name="structure-permissions-registry"),
    path("owner/", OwnerStructuresView.as_view(), name="structure-owner"),
    path("team/", MyStructureTeamView.as_view(), name="structure-team"),
    path("team/<uuid:member_id>/status/", StructureTeamMemberStatusView.as_view(), name="structure-team-status"),
    path("team/<uuid:member_id>/permissions/", MemberPermissionsView.as_view(), name="structure-team-permissions"),
    path("create/", CreateStructureView.as_view(), name="structure-create"),

    path("admin/list/", AdminListStructuresView.as_view(), name="structure-admin-list"),

    path("admin/validate/<uuid:pk>/", ValidateStructureView.as_view(), name="structure-validate"),

    path("<uuid:pk>/", StructureDetailView.as_view(), name="structure-detail"),
    path("proches/", StructuresProchesView.as_view()),
    path("submit/", StructureFormSubmitView.as_view()),

    path("favoris/", ListFavorisView.as_view(), name="favoris-list"),
    path("favoris/add/", AddFavoriView.as_view(), name="favoris-add"),
    path("favoris/<uuid:structure_id>/remove/", RemoveFavoriView.as_view(), name="favoris-remove"),
    path("favoris/<uuid:structure_id>/check/", CheckFavoriView.as_view(), name="favoris-check"),

    path("<uuid:structure_id>/horaires/", ListHorairesView.as_view(), name="horaires-list"),
    path("<uuid:structure_id>/horaires/set/", SetHorairesView.as_view(), name="horaires-set"),
    path("horaires/<uuid:pk>/", UpdateSingleHoraireView.as_view(), name="horaire-update"),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
