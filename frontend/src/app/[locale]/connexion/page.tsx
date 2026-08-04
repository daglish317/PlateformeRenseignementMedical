"use client";

import { useTranslations } from "next-intl";

import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Divider } from "@/features/auth/components/Divider";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { Link } from "@/i18n/navigation";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";
import { GuestRoute } from "@/features/auth/components/GuestRoute";

export default function LoginPage() {
  const t = useTranslations("auth");
  const { redirectAfterAuth } = useAuthRedirect();

  return (
    <GuestRoute>
      <PublicLayout showSearch={false} showFooter={true}>
        <AuthLayout>
          <AuthCard title={t("loginTitle")}>
            <div className="space-y-6">
              <LoginForm onSuccess={redirectAfterAuth} />

              <Divider />

              <GoogleButton onSuccess={redirectAfterAuth} />

              <p className="text-center text-sm text-muted-foreground">
                {t("noAccount")}{" "}
                <Link href="/inscription" className="text-primary hover:underline">
                  {t("signUp")}
                </Link>
              </p>
            </div>
          </AuthCard>
        </AuthLayout>
      </PublicLayout>
    </GuestRoute>
  );
}
