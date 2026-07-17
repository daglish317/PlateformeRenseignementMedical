"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Divider } from "@/features/auth/components/Divider";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { Link } from "@/i18n/navigation";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";
import { GuestRoute } from "@/features/auth/components/GuestRoute";

export default function RegisterPage() {
  const { redirectAfterAuth } = useAuthRedirect();

  return (
    <GuestRoute>
      <PublicLayout showSearch={false} showFooter={true}>
        <AuthLayout>
          <AuthCard title="Inscription">
            <div className="space-y-6">
              <RegisterForm onSuccess={redirectAfterAuth} />

              <Divider />

              <GoogleButton onSuccess={redirectAfterAuth} />

              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte?{" "}
                <Link href="/connexion" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </AuthCard>
        </AuthLayout>
      </PublicLayout>
    </GuestRoute>
  );
}
