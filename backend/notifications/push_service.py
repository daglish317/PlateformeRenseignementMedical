import base64
import json
from dataclasses import dataclass
from typing import Any
from datetime import datetime, timezone as dt_timezone

from django.conf import settings
from django.utils import timezone
from py_vapid import Vapid02
from pywebpush import WebPushException, webpush
from cryptography.hazmat.primitives import serialization

from .models import PushSubscription


@dataclass(frozen=True)
class VapidConfig:
    public_key: str
    private_key: str
    subject: str
    vapid: Vapid02


def _build_vapid() -> VapidConfig:
    public_key = getattr(settings, "WEB_PUSH_VAPID_PUBLIC_KEY", "")
    private_key = getattr(settings, "WEB_PUSH_VAPID_PRIVATE_KEY", "")
    subject = getattr(settings, "WEB_PUSH_VAPID_SUBJECT", "mailto:support@santeprox.local")

    if public_key and private_key:
        vapid = Vapid02.from_pem(private_key)
        return VapidConfig(
            public_key=public_key,
            private_key=private_key,
            subject=subject,
            vapid=vapid,
        )

    vapid = Vapid02()
    vapid.generate_keys()
    public_key = base64.urlsafe_b64encode(
        vapid.public_key.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint,
        )
    ).decode("utf-8").rstrip("=")
    private_key = vapid.private_pem().decode("utf-8")
    return VapidConfig(
        public_key=public_key,
        private_key=private_key,
        subject=subject,
        vapid=vapid,
    )


_VAPID = None


def get_vapid() -> VapidConfig:
    global _VAPID
    if _VAPID is None:
        _VAPID = _build_vapid()
    return _VAPID


def _payload(notification, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = payload or {}
    click_url = data.get("click_url") or _resolve_click_url(notification)
    return {
        "id": str(notification.id),
        "titre": notification.titre,
        "message": notification.message,
        "type": notification.type,
        "nav_item": notification.nav_item or "",
        "structure_id": str(notification.structure_id) if notification.structure_id else None,
        "date_creation": notification.date_creation.isoformat(),
        **data,
        "click_url": click_url,
    }


def _resolve_click_url(notification) -> str:
    """Retourne la route métier la plus pertinente pour le clic push."""
    nav_item = (notification.nav_item or "").strip().lower()
    mapping = {
        "alertes": "/owner/alertes",
        "messages": "/owner/chat",
        "message": "/owner/chat",
        "stock": "/owner/inventaires",
        "inventaires": "/owner/inventaires",
        "history": "/owner/history",
        "historique": "/owner/history",
        "caisse": "/owner/caisse",
        "statistics": "/owner/statistics",
        "statistiques": "/owner/statistics",
        "profil": "/owner/profile",
        "profile": "/owner/profile",
        "team": "/owner/team",
        "structures": "/owner/team",
        "notifications": "/owner/alertes",
        "settings": "/owner/settings",
        "parametres": "/owner/settings",
    }
    if nav_item in mapping:
        return mapping[nav_item]
    return "/owner"


class PushService:
    @staticmethod
    def get_public_key() -> str:
        return get_vapid().public_key

    @staticmethod
    def save_subscription(*, utilisateur, subscription_data, user_agent=""):
        keys = subscription_data.get("keys") or {}
        endpoint = subscription_data.get("endpoint")
        if not endpoint:
            raise ValueError("Endpoint de subscription manquant.")

        expiration_time = subscription_data.get("expirationTime")
        if isinstance(expiration_time, (int, float)):
            expiration_time = datetime.fromtimestamp(
                expiration_time / 1000,
                tz=dt_timezone.utc,
            )
        else:
            expiration_time = None

        subscription, _ = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "utilisateur": utilisateur,
                "p256dh": keys.get("p256dh", ""),
                "auth": keys.get("auth", ""),
                "expiration_time": expiration_time,
                "user_agent": user_agent[:512],
                "est_active": True,
            },
        )
        return subscription

    @staticmethod
    def remove_subscription(*, utilisateur, endpoint):
        return PushSubscription.objects.filter(
            utilisateur=utilisateur,
            endpoint=endpoint,
        ).update(est_active=False)

    @staticmethod
    def send_notification(*, notification, payload=None):
        if notification.utilisateur.role != "PROPRIETAIRE":
            return 0

        payload_json = json.dumps(_payload(notification, payload), ensure_ascii=False)
        vapid = get_vapid()
        subscriptions = PushSubscription.objects.filter(
            utilisateur=notification.utilisateur,
            est_active=True,
        )
        sent = 0

        for subscription in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": subscription.endpoint,
                        "keys": {
                            "p256dh": subscription.p256dh,
                            "auth": subscription.auth,
                        },
                    },
                    data=payload_json,
                    vapid_private_key=vapid.vapid,
                    vapid_claims={
                        "sub": vapid.subject,
                    },
                    ttl=60,
                )
                sent += 1
            except WebPushException:
                PushSubscription.objects.filter(pk=subscription.pk).update(est_active=False)
            except Exception:
                continue
        return sent
