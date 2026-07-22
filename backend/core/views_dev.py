from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response


class DevOtpickerView(APIView):
    """
    Endpoint dev-only: retourne le dernier OTP pour un email.
    Utilisable uniquement en mode DEBUG.
    """
    def get(self, request):
        if not settings.DEBUG:
            return Response({"detail": "Non disponible en production"}, status=403)

        email = request.query_params.get("email", "").strip().lower()
        if not email:
            return Response({"detail": "email requis"}, status=400)

        from core.verification.code import VerificationCode
        code_obj = VerificationCode.objects.filter(
            email=email, is_used=False
        ).order_by("-created_at").first()

        if not code_obj:
            return Response({"detail": "Aucun code actif trouvé"}, status=404)

        return Response({
            "email": email,
            "code": code_obj.code,
            "expires_at": code_obj.expires_at.isoformat(),
        })
