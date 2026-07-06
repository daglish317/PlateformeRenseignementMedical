import random

from django.utils import timezone

from utilisateurs.models import Utilisateur

from .code import VerificationCode
from .session import VerificationSession
from .attempts import VerificationAttempt
from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes
from core.utils.rate_limit import RateLimiter


class VerificationService:

    MAX_SEND_PER_HOUR = 5
    MAX_CHECK_ATTEMPTS = 3

    @staticmethod
    def generate(email):
        email = email.lower().strip()

        if not RateLimiter.is_allowed(
            f"otp_send:{email}", VerificationService.MAX_SEND_PER_HOUR, 3600
        ):
            raise ValueError("Trop de demandes de code. Réessayez plus tard.")

        code = str(random.randint(1000, 9999))

        VerificationCode.objects.create(
            email=email,
            code=code,
            expires_at=VerificationCode.generate_expiry(),
        )

        EventDispatcher.dispatch(
            EventTypes.OTP_GENERATED,
            {"email": email, "code": code},
        )

        return code

    @staticmethod
    def check(email, code):
        email = email.lower().strip()

        recent_attempts = VerificationAttempt.objects.filter(
            email=email,
            created_at__gte=timezone.now() - timezone.timedelta(minutes=15),
        ).count()

        if recent_attempts >= VerificationService.MAX_CHECK_ATTEMPTS:
            return False

        verification = VerificationCode.objects.filter(
            email=email,
            code=code,
            is_used=False,
        ).first()

        if not verification or not verification.is_valid():
            VerificationAttempt.objects.create(email=email)
            return False

        verification.is_used = True
        verification.save()

        VerificationSession.objects.create(
            email=email,
            is_verified=True,
            expires_at=VerificationSession.generate_expiry(),
        )

        Utilisateur.objects.filter(email=email).update(email_verifie=True)
        RateLimiter.reset(f"otp_check:{email}")

        return True
