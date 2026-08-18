"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const { redirectAfterAuth } = useAuthRedirect();
  const returnTo = searchParams.get("returnTo");
  const registerHref = returnTo
    ? `/inscription?returnTo=${encodeURIComponent(returnTo)}`
    : "/inscription";

  return (
    <GuestRoute>
      <AuthLayout>
        <AuthCard title={t("loginTitle")} mode="login">
          <div className="space-y-6">
            <LoginForm onSuccess={redirectAfterAuth} />

            <Divider />

            <GoogleButton onSuccess={redirectAfterAuth} />

            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href={registerHref} className="font-medium text-primary hover:underline">
                {t("signUp")}
              </Link>
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    </GuestRoute>
  );
}
