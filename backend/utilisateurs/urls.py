from django.urls import path
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
    path("register/", RegisterView.as_view()),
    path("register/admin/", RegisterAdminView.as_view()),
    path("login/", LoginView.as_view()),
    path("google/", GoogleAuthView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("admin/invite/", InviteGestionnaireView.as_view()),
    path("admin/dashboard/", AdminDashboardView.as_view()),
    path("admin/users/", AdminUsersListView.as_view()),
    path("admin/users/<uuid:pk>/", AdminUserDetailView.as_view()),
    path("admin/managers/", AdminManagersListView.as_view()),
    path("admin/managers/<uuid:pk>/", AdminManagerDetailView.as_view()),
    path("admin/statistics/", AdminStatisticsView.as_view()),
    path("gestionnaire/validate-otp/", ValidateGestionnaireOtpView.as_view()),
    path("gestionnaire/set-password/", SetGestionnairePasswordView.as_view()),
]
