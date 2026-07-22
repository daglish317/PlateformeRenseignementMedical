import logging

from django.conf import settings

from core.email.service import EmailService
from core.email.templates import EmailTemplates

from notifications.service import NotificationService
from notifications.models import TypeNotification

from utilisateurs.models import Utilisateur, RoleUtilisateur

logger = logging.getLogger("core.events")


def handle_otp_generated(event):

    email = event["email"]
    code = event["code"]

    logger.info("OTP généré pour %s: %s", email, code)

    if getattr(settings, "DEBUG", False):
        print(f"[DEV OTP] {email} -> {code}")


def handle_user_invited(event):

    utilisateur = event["utilisateur"]
    email = event["email"]

    from core.verification.code import VerificationCode

    code_obj = VerificationCode.objects.filter(
        email=email, is_used=False
    ).order_by("-created_at").first()
    code = code_obj.code if code_obj else ""

    if getattr(settings, "DEBUG", False):
        print(f"[DEV] Invitation OTP pour {email}: {code}")

    lien_activation = f"http://localhost:3000/fr/inscription"

    template = EmailTemplates.invitation_gestionnaire(
        utilisateur.nom, email, code, lien_activation=lien_activation
    )
    EmailService.envoyer_email(
        sujet=template["sujet"],
        message=template["message"],
        destinataire=email,
        html_message=template.get("html"),
    )


def handle_structure_created(event):

    structure = event["structure"]
    administrateurs = Utilisateur.objects.filter(role=RoleUtilisateur.ADMINISTRATEUR)

    for administrateur in administrateurs:
        NotificationService.envoyer(
            utilisateur=administrateur,
            titre="Nouvelle structure",
            message=f"La structure '{structure.nom}' attend votre validation.",
            type=TypeNotification.ADMIN,
            structure=structure,
        )


def handle_structure_validated(event):

    structure = event["structure"]
    email = EmailTemplates.structure_validee(structure.nom)

    EmailService.envoyer_email(
        sujet=email["sujet"],
        message=email["message"],
        destinataire=structure.gestionnaire.email,
        html_message=email.get("html"),
    )

    NotificationService.envoyer(
        utilisateur=structure.gestionnaire,
        titre="Structure validée",
        message=f"Votre structure '{structure.nom}' a été validée.",
        type=TypeNotification.SYSTEM,
        structure=structure,
    )


def handle_structure_rejected(event):

    structure = event["structure"]
    motif = event.get("motif", "Non précisé")

    template = EmailTemplates.structure_refusee(structure.nom, motif)

    EmailService.envoyer_email(
        sujet=template["sujet"],
        message=template["message"],
        destinataire=structure.gestionnaire.email,
        html_message=template.get("html"),
    )

    NotificationService.envoyer(
        utilisateur=structure.gestionnaire,
        titre="Structure refusée",
        message=f"Votre structure '{structure.nom}' a été refusée.\n\nMotif : {motif}",
        type=TypeNotification.SYSTEM,
        structure=structure,
    )


def handle_feedback_created(event):
    logger.info("Feedback créé: %s", event.get("feedback"))


def handle_message_sent(event):
    logger.info("Message envoyé: %s", event.get("message"))


def log_event(event_type, payload):
    logger.info("Event %s: %s", event_type, payload)
