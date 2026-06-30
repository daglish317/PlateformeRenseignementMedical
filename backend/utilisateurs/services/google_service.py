from google.oauth2 import id_token
from google.auth.transport import requests


class GoogleAuthService:
    @staticmethod
    def verify_google_token(token: str):
        """
        Vérifie le token Google ID et retourne les infos utilisateur
        """
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                audience=None  # on mettra CLIENT_ID plus tard
            )

            return {
                "email": idinfo["email"],
                "nom": idinfo.get("name", ""),
                "email_verified": idinfo.get("email_verified", False),
            }

        except Exception:
            return None