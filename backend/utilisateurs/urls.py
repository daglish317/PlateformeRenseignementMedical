from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    GoogleAuthView,
    LogoutView,
    MeView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    InviteGestionnaireView,
    ValidateGestionnaireOtpView,
    SetGestionnairePasswordView,
    CheckGestionnaireView,
    ActivateGestionnaireView,
)
from .views_admin import (
    RegisterAdminView,
    AdminDashboardView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminManagersListView,
    AdminManagerDetailView,
    AdminStatisticsView,
)

urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view()),
    re_path(r"^register/admin/?$", RegisterAdminView.as_view()),
    re_path(r"^login/?$", LoginView.as_view()),
    re_path(r"^google/?$", GoogleAuthView.as_view()),
    re_path(r"^logout/?$", LogoutView.as_view()),
    re_path(r"^me/?$", MeView.as_view()),
    re_path(r"^change-password/?$", ChangePasswordView.as_view()),
    re_path(r"^forgot-password/?$", ForgotPasswordView.as_view()),
    re_path(r"^reset-password/?$", ResetPasswordView.as_view()),
    re_path(r"^token/refresh/?$", TokenRefreshView.as_view()),
    re_path(r"^admin/invite/?$", InviteGestionnaireView.as_view()),
    re_path(r"^admin/dashboard/?$", AdminDashboardView.as_view()),
    re_path(r"^admin/users/?$", AdminUsersListView.as_view()),
    re_path(r"^admin/users/(?P<pk>[0-9a-f-]+)/?$", AdminUserDetailView.as_view()),
    re_path(r"^admin/managers/?$", AdminManagersListView.as_view()),
    re_path(r"^admin/managers/(?P<pk>[0-9a-f-]+)/?$", AdminManagerDetailView.as_view()),
    re_path(r"^admin/statistics/?$", AdminStatisticsView.as_view()),
    re_path(r"^gestionnaire/validate-otp/?$", ValidateGestionnaireOtpView.as_view()),
    re_path(r"^gestionnaire/set-password/?$", SetGestionnairePasswordView.as_view()),
    re_path(r"^gestionnaire/check/?$", CheckGestionnaireView.as_view()),
    re_path(r"^gestionnaire/activate/?$", ActivateGestionnaireView.as_view()),
]
