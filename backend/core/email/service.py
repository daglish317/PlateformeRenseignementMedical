import logging

from django.core.mail import EmailMultiAlternatives
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
            from_email = getattr(settings, "EMAIL_HOST_USER", settings.DEFAULT_FROM_EMAIL)
            reply_to = getattr(settings, "REPLY_TO_EMAIL", settings.DEFAULT_FROM_EMAIL)

            email_msg = EmailMultiAlternatives(
                subject=sujet,
                body=message,
                from_email=from_email,
                to=[destinataire],
                reply_to=[reply_to],
            )

            email_msg.extra_headers["List-Unsubscribe"] = f"<mailto:{from_email}?subject=unsubscribe>"
            email_msg.extra_headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
            email_msg.extra_headers["Precedence"] = "bulk"
            email_msg.extra_headers["X-Mailer"] = "SanteProx/1.0"
            email_msg.extra_headers["X-Auto-Response-Suppress"] = "All"
            email_msg.extra_headers["Auto-Submitted"] = "auto-generated"

            if html_message:
                email_msg.attach_alternative(html_message, "text/html")

            email_msg.send(fail_silently=True)
        except Exception as e:
            logger.error("Erreur envoi email a %s: %s", destinataire, e)

    @staticmethod
    def envoyer_email_otp_dev(email: str, code: str):
        if not getattr(settings, "DEBUG", False):
            return
        print(f"[DEV OTP] Email: {email} | Code OTP: {code}")
        logger.info("[DEV OTP] Email: %s | Code OTP: %s", email, code)
