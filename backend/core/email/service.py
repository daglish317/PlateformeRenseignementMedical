from django.core.mail import send_mail
from django.conf import settings


class EmailService:

    @staticmethod
    def envoyer_email(
        sujet: str,
        message: str,
        destinataire: str,
        html_message: str = None,
    ):

        send_mail(
            subject=sujet,
            message=message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER),
            recipient_list=[destinataire],
            fail_silently=False,
            html_message=html_message,
        )
