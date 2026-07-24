"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { GestionnaireActivationForm } from "@/features/auth/components/GestionnaireActivationForm";
import { Divider } from "@/features/auth/components/Divider";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { Link } from "@/i18n/navigation";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";

export default function RegisterPage() {
  const { redirectAfterAuth } = useAuthRedirect();
  const router = useRouter();
  const [isGestionnaire, setIsGestionnaire] = useState(false);

  const handleGestionnaireSuccess = () => {
    router.push("/gestionnaire/setup");
  };

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <AuthLayout>
        <AuthCard title={isGestionnaire ? "Activation du compte" : "Inscription"}>
          <div className="space-y-6">
            {isGestionnaire ? (
              <GestionnaireActivationForm
                onSuccess={handleGestionnaireSuccess}
                onBackToRegister={() => setIsGestionnaire(false)}
              />
            ) : (
              <>
                <RegisterForm onSuccess={redirectAfterAuth} />

                <Divider />

                <GoogleButton onSuccess={redirectAfterAuth} />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsGestionnaire(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Vous êtes gestionnaire ? Activez votre compte
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {isGestionnaire ? (
                <>
                  Pas de compte gestionnaire?{" "}
                  <button
                    type="button"
                    onClick={() => setIsGestionnaire(false)}
                    className="text-primary hover:underline"
                  >
                    S&apos;inscrire normalement
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte?{" "}
                  <Link href="/connexion" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </>
              )}
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    </PublicLayout>
  );
}
