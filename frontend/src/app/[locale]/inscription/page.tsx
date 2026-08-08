"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("auth");
  const { redirectAfterAuth } = useAuthRedirect();
  const [isOwnerActivation, setIsOwnerActivation] = useState(false);

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <AuthLayout>
        <AuthCard title={isOwnerActivation ? t("activationTitle") : t("registerTitle")}>
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
                    className="text-sm text-primary hover:underline"
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
                    className="text-primary hover:underline"
                  >
                    {t("normalRegister")}
                  </button>
                </>
              ) : (
                <>
                  {t("hasAccount")}{" "}
                  <Link href="/connexion" className="text-primary hover:underline">
                    {t("signIn")}
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
