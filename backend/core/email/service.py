import logging

from django.core.mail import EmailMessage
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
            logger.info("[DEV EMAIL] A: %s | Sujet: %s", destinataire, sujet)
            logger.info("[DEV EMAIL] Corps:\n%s", message)

        try:
            email_msg = EmailMessage(
                subject=sujet,
                body=html_message or message,
                from_email=f"SantéProx <{settings.DEFAULT_FROM_EMAIL}>",
                to=[destinataire],
                reply_to=[getattr(settings, "REPLY_TO_EMAIL", settings.DEFAULT_FROM_EMAIL)],
            )
            email_msg.extra_headers["List-Unsubscribe"] = f"<mailto:{settings.DEFAULT_FROM_EMAIL}?subject=unsubscribe>"
            email_msg.extra_headers["X-Mailer"] = "SanteProx"

            if html_message:
                email_msg.content_subtype = "html"

            email_msg.send(fail_silently=True)
        except Exception as e:
            logger.error("Erreur envoi email a %s: %s", destinataire, e)

    @staticmethod
    def envoyer_email_otp_dev(email: str, code: str):
        if not getattr(settings, "DEBUG", False):
            return
        print(f"[DEV OTP] Email: {email} | Code OTP: {code}")
        logger.info("[DEV OTP] Email: %s | Code OTP: %s", email, code)
