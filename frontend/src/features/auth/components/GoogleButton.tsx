"use client";

import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@/features/auth/hooks/useGoogleLogin";
import { toast } from "sonner";

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const isGoogleReady = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return Boolean(w?.google?.accounts?.id);
};

export function GoogleButton({
  onSuccess,
  onError,
}: GoogleButtonProps) {
  const { mutate: authenticate, isPending } = useGoogleLogin();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && isGoogleReady()
  );
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (scriptReady) return;

    const timeout = window.setTimeout(() => setScriptFailed(true), 10000);
    const interval = window.setInterval(() => {
      if (isGoogleReady()) {
        setScriptReady(true);
        window.clearInterval(interval);
        window.clearTimeout(timeout);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [scriptReady]);

  if (!googleClientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground"
      >
        Google non configuré
      </button>
    );
  }

  if (!scriptReady) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        {scriptFailed
          ? "Impossible de charger le bouton Google. Réessayez après actualisation."
          : "Chargement de Google..."}
      </div>
    );
  }

  const handleCredential = (credential?: string) => {
    if (!credential) {
      toast.error("Impossible de récupérer le jeton Google");
      return;
    }

    authenticate(
      { id_token: credential },
      {
        onSuccess: () => {
          toast.success("Connexion Google réussie");
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Erreur Google:", error);
          toast.error("Erreur lors de la connexion Google");
          onError?.(error);
        },
      }
    );
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex w-full justify-center">
        <GoogleLogin
          shape="rectangular"
          size="large"
          theme="outline"
          text="continue_with"
          onSuccess={(response) => handleCredential(response.credential)}
          onError={() => {
            console.error("Erreur Google: la fenêtre de connexion a échoué");
            toast.error("Erreur lors de la connexion Google");
          }}
        />
      </div>

      {isPending && (
        <p className="text-center text-sm text-muted-foreground">
          Connexion en cours...
        </p>
      )}
    </div>
  );
}
