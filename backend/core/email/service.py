import logging

from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger("core.email")


class EmailService:

    @staticmethod
    def envoyer_email(
        sujet: str,
        message: str,
        destinataire: str,
        html_message: str = None,
    ):
        if getattr(settings, "DEBUG", False):
            logger.info("[DEV EMAIL] À: %s | Sujet: %s", destinataire, sujet)
            logger.info("[DEV EMAIL] Corps:\n%s", message)

        try:
            send_mail(
                subject=sujet,
                message=message,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER),
                recipient_list=[destinataire],
                fail_silently=True,
                html_message=html_message,
            )
        except Exception as e:
            logger.error("Erreur envoi email à %s: %s", destinataire, e)

    @staticmethod
    def envoyer_email_otp_dev(email: str, code: str):
        if not getattr(settings, "DEBUG", False):
            return
        print(f"[DEV OTP] Email: {email} | Code OTP: {code}")
        logger.info("[DEV OTP] Email: %s | Code OTP: %s", email, code)
