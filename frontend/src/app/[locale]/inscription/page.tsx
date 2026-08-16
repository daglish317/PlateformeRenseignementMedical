"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { GestionnaireActivationForm } from "@/features/auth/components/GestionnaireActivationForm";
import { Divider } from "@/features/auth/components/Divider";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { Link } from "@/i18n/navigation";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { redirectAfterAuth } = useAuthRedirect();
  const [isOwnerActivation, setIsOwnerActivation] = useState(false);

  return (
    <AuthLayout>
      <AuthCard
        title={isOwnerActivation ? t("activationTitle") : t("registerTitle")}
        mode={isOwnerActivation ? "activation" : "register"}
      >
        <div className="space-y-6">
          {isOwnerActivation ? (
            <GestionnaireActivationForm
              onSuccess={redirectAfterAuth}
              onBackToRegister={() => setIsOwnerActivation(false)}
            />
          ) : (
            <>
              <RegisterForm onSuccess={redirectAfterAuth} />

              <Divider />

              <GoogleButton onSuccess={redirectAfterAuth} />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsOwnerActivation(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("managerAccount")}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {isOwnerActivation ? (
              <>
                {t("noManagerAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setIsOwnerActivation(false)}
                  className="font-medium text-primary hover:underline"
                >
                  {t("normalRegister")}
                </button>
              </>
            ) : (
              <>
                {t("hasAccount")}{" "}
                <Link href="/connexion" className="font-medium text-primary hover:underline">
                  {t("signIn")}
                </Link>
              </>
            )}
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
