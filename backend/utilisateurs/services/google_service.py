from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests


class GoogleAuthService:

    @staticmethod
    def verify_google_token(token: str):
        try:
            client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                audience=client_id,
            )
            return {
                "email": idinfo["email"],
                "nom": idinfo.get("name", ""),
                "email_verified": idinfo.get("email_verified", False),
            }
        except Exception:
            return None
