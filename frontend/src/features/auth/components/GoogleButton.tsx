"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@/features/auth/hooks/useGoogleLogin";
import { toast } from "sonner";

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function GoogleButton({
  onSuccess,
  onError,
}: GoogleButtonProps) {

  const {
    mutate: authenticate,
    isPending,
  } = useGoogleLogin();


  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;


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

      <GoogleLogin
        text="continue_with"

        onSuccess={(credentialResponse) => {

          const token = credentialResponse.credential;


          if (!token) {
            toast.error(
              "Impossible de récupérer le jeton Google"
            );
            return;
          }


          authenticate(
            {
              id_token: token,
            },
            {
              onSuccess: () => {

                toast.success(
                  "Connexion Google réussie"
                );

                onSuccess?.();
              },


              onError: (error) => {

                console.error(
                  "Erreur Google:",
                  error
                );

                toast.error(
                  "Erreur lors de la connexion Google"
                );

                onError?.(error);
              },
            }
          );
        }}


        onError={() => {

          toast.error(
            "La connexion Google a échoué"
          );

          onError?.(
            new Error(
              "Google login failed"
            )
          );
        }}
      />


      {isPending && (
        <p className="text-center text-sm text-muted-foreground">
          Connexion en cours...
        </p>
      )}

    </div>
  );
}