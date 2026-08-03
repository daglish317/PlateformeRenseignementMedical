"use client";

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
  const { redirectAfterAuth } = useAuthRedirect();

  return (
    <GuestRoute>
      <PublicLayout showSearch={false} showFooter={true}>
        <AuthLayout>
          <AuthCard title="Connexion">
            <div className="space-y-6">
              <LoginForm onSuccess={redirectAfterAuth} />

              <Divider />

              <GoogleButton onSuccess={redirectAfterAuth} />

              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte?{" "}
                <Link href="/inscription" className="text-primary hover:underline">
                  S&apos;inscrire
                </Link>
              </p>
            </div>
          </AuthCard>
        </AuthLayout>
      </PublicLayout>
    </GuestRoute>
  );
}
