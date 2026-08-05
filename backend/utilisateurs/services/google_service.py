import logging

from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token

logger = logging.getLogger(__name__)


class GoogleAuthError(Exception):
    pass


class GoogleAuthService:

    @staticmethod
    def verify_google_token(token: str):
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")

        if not client_id:
            raise GoogleAuthError("Google OAuth n'est pas configur\u00e9.")

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                audience=client_id,
            )
        except Exception as exc:
            logger.error(
                "Google token verification failed (audience=%s): %s: %s",
                client_id,
                type(exc).__name__,
                exc,
            )
            raise GoogleAuthError("Token Google invalide.") from exc

        email = idinfo.get("email", "").lower().strip()
        email_verified = bool(idinfo.get("email_verified", False))

        if not email or not email_verified:
            raise GoogleAuthError("Adresse email Google non v\u00e9rifi\u00e9e.")

        return {
            "email": email,
            "nom": idinfo.get("name") or email.split("@")[0],
            "email_verified": email_verified,
            "google_id": idinfo.get("sub", ""),
        }
