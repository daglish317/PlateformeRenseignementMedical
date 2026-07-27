"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useGoogleLogin } from "@/features/auth/hooks/useGoogleLogin";
import { toast } from "sonner";

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

let googleInitialized = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getGoogleAccountsId = (): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w?.google?.accounts?.id;
};

export function GoogleButton({
  onSuccess,
  onError,
}: GoogleButtonProps) {
  const { mutate: authenticate, isPending } = useGoogleLogin();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<{ onSuccess?: () => void; onError?: (error: unknown) => void }>({
    onSuccess,
    onError,
  });
  const [scriptReady, setScriptReady] = useState(false);

  callbackRef.current = { onSuccess, onError };

  const handleCredentialResponse = useCallback(
    (response: { credential?: string }) => {
      const token = response.credential;

      if (!token) {
        toast.error("Impossible de récupérer le jeton Google");
        return;
      }

      authenticate(
        { id_token: token },
        {
          onSuccess: () => {
            toast.success("Connexion Google réussie");
            callbackRef.current.onSuccess?.();
          },
          onError: (error) => {
            console.error("Erreur Google:", error);
            toast.error("Erreur lors de la connexion Google");
            callbackRef.current.onError?.(error);
          },
        }
      );
    },
    [authenticate]
  );

  useEffect(() => {
    if (getGoogleAccountsId()) {
      setScriptReady(true);
      return;
    }

    const onScriptLoad = () => setScriptReady(true);

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", onScriptLoad, { once: true });
      return () => existing.removeEventListener("load", onScriptLoad);
    }
  }, []);

  useEffect(() => {
    if (!scriptReady || googleInitialized || !googleClientId || !containerRef.current) {
      return;
    }

    const idApi = getGoogleAccountsId();
    if (!idApi) return;

    googleInitialized = true;

    idApi.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
    });

    idApi.renderButton(containerRef.current, {
      text: "continue_with",
      theme: "outline",
      size: "large",
      width: containerRef.current.offsetWidth || 300,
    });
  }, [scriptReady, googleClientId, handleCredentialResponse]);

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

  return (
    <div className="w-full space-y-2">
      <div ref={containerRef} className="w-full" />

      {isPending && (
        <p className="text-center text-sm text-muted-foreground">
          Connexion en cours...
        </p>
      )}
    </div>
  );
}
