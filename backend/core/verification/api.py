from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .service import VerificationService


class SendVerificationCode(APIView):

    def post(self, request):

        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            VerificationService.generate(email)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        return Response({"message": "Code envoyé avec succès"})


class ConfirmVerificationCode(APIView):

    def post(self, request):

        email = request.data.get("email")
        code = request.data.get("code")

        if VerificationService.check(email, code):
            return Response({"message": "Code validé"})

        return Response({"detail": "Code invalide ou expiré"}, status=400)
