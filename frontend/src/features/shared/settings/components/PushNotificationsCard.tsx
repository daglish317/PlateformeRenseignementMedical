"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, BellOff, Loader2 } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pushNotificationsService } from "../api/push-notifications.service";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function bufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function PushNotificationsCard() {
  const role = useAuthStore((state) => state.user?.role);
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  const isOwner = role === "PROPRIETAIRE";

  useEffect(() => {
    let cancelled = false;

    async function refreshState() {
      if (!isOwner) {
        setChecking(false);
        return;
      }

      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) {
          setSupported(false);
          setChecking(false);
        }
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!cancelled) {
          setEnabled(Boolean(subscription));
          setSupported(true);
        }
      } catch {
        if (!cancelled) {
          setSupported(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    refreshState();

    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  const statusLabel = useMemo(() => {
    if (!isOwner) return "Réservé au propriétaire";
    if (!supported) return "Non pris en charge sur cet appareil";
    if (checking) return "Vérification...";
    return enabled ? "Actives sur cet appareil" : "Désactivées sur cet appareil";
  }, [checking, enabled, isOwner, supported]);

  async function enableNotifications(nextValue: boolean) {
    setMessage("");
    if (!isOwner || !supported) return;

    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;

      if (!nextValue) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await pushNotificationsService.unsubscribe(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setEnabled(false);
        return;
      }

      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("L'autorisation de notification est nécessaire pour activer ce module.");
        return;
      }

      const publicKey = await pushNotificationsService.getPublicKey();
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const p256dh = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");

      if (!p256dh || !auth) {
        setMessage("Impossible de lire les clés de la subscription push.");
        return;
      }

      await pushNotificationsService.subscribe({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime ?? null,
        keys: {
          p256dh: bufferToBase64Url(p256dh),
          auth: bufferToBase64Url(auth),
        },
      });

      setEnabled(true);
      setMessage("Notifications push activées pour cet appareil.");
    } catch {
      setMessage("Impossible de mettre à jour les notifications push.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications push</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Recevoir les alertes sur cet appareil</p>
            <p className="text-xs text-muted-foreground">
              Stock faible et péremption proche uniquement.
            </p>
          </div>
          <Button
            type="button"
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={() => enableNotifications(!enabled)}
            disabled={loading || checking || !supported}
          >
            {enabled ? "Actives" : "Inactives"}
          </Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{statusLabel}</p>
          <Button
            type="button"
            variant={enabled ? "destructive" : "secondary"}
            size="sm"
            onClick={() => enableNotifications(!enabled)}
            disabled={loading || checking || !supported}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : enabled ? (
              <BellOff className="mr-2 h-4 w-4" />
            ) : (
              <BellRing className="mr-2 h-4 w-4" />
            )}
            {enabled ? "Désactiver" : "Activer"}
          </Button>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
