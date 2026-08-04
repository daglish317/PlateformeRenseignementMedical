"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { useGoogleLogin } from "@/features/auth/hooks/useGoogleLogin";
import {
  getGoogleIdentityApi,
  initializeGoogleIdentity,
  loadGoogleIdentityScript,
} from "@/features/auth/utils/google-identity";

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

type GoogleButtonStatus = "loading" | "ready" | "error";

type MessageBundle = {
  googleMissingToken: string;
  googleSuccess: string;
  googleError: string;
  googleLoadFailed: string;
  googleLoading: string;
  googleNotConfigured: string;
  googlePending: string;
};

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { mutate: authenticate, isPending } = useGoogleLogin();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleLoginEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED !== "false";
  const buttonRef = useRef<HTMLDivElement>(null);
  const authenticateRef = useRef(authenticate);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Utiliser useMemo au lieu de useRef pour les messages
  const messages = useMemo<MessageBundle>(() => ({
    googleMissingToken: t("googleMissingToken"),
    googleSuccess: t("googleSuccess"),
    googleError: t("googleError"),
    googleLoadFailed: t("googleLoadFailed"),
    googleLoading: t("googleLoading"),
    googleNotConfigured: t("googleNotConfigured"),
    googlePending: t("googlePending"),
  }), [t]);
  
  const messagesRef = useRef(messages);
  const [status, setStatus] = useState<GoogleButtonStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    authenticateRef.current = authenticate;
  }, [authenticate]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Mettre à jour messagesRef quand messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!googleLoginEnabled || !googleClientId) {
      return;
    }

    let cancelled = false;

    const renderButton = async () => {
      setStatus("loading");

      try {
        await loadGoogleIdentityScript(locale === "fr" ? "fr_FR" : "en");

        if (cancelled) {
          return;
        }

        const api = getGoogleIdentityApi();

        if (!api) {
          throw new Error("Google Identity Services API is unavailable.");
        }

        initializeGoogleIdentity(googleClientId, (response) => {
          const credential = response.credential;

          if (!credential) {
            toast.error(messagesRef.current.googleMissingToken);
            onErrorRef.current?.(new Error(messagesRef.current.googleMissingToken));
            return;
          }

          authenticateRef.current(
            { id_token: credential },
            {
              onSuccess: () => {
                toast.success(messagesRef.current.googleSuccess);
                onSuccessRef.current?.();
              },
              onError: (error) => {
                console.error("Google authentication error:", error);
                toast.error(messagesRef.current.googleError);
                onErrorRef.current?.(error);
              },
            }
          );
        });

        if (cancelled || !buttonRef.current) {
          return;
        }

        buttonRef.current.innerHTML = "";
        api.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Google button load error:", error);
          setStatus("error");
        }
      }
    };

    const buttonElement = buttonRef.current;

    void renderButton();

    return () => {
      cancelled = true;

      if (buttonElement) {
        buttonElement.innerHTML = "";
      }
    };
  }, [attempt, googleClientId, googleLoginEnabled, locale]);

  if (!googleLoginEnabled || !googleClientId) {
    return (
      <div className="w-full rounded-md border border-dashed border-border bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
        {messages.googleNotConfigured}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative min-h-[48px] w-full">
        {status !== "ready" ? (
          <button
            type="button"
            onClick={
              status === "error"
                ? () => setAttempt((current) => current + 1)
                : undefined
            }
            disabled={status === "loading"}
            className="relative z-10 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-80"
          >
            {status === "loading"
              ? messages.googleLoading
              : messages.googleLoadFailed}
          </button>
        ) : null}

        <div
          ref={buttonRef}
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            status === "ready" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </div>

      {isPending ? (
        <p className="text-center text-sm text-muted-foreground">
          {messages.googlePending}
        </p>
      ) : null}
    </div>
  );
}
