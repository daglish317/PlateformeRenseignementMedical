"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { PublicFeedbackForm } from "@/features/public-feedback/components/PublicFeedbackForm";
import { FeedbackAuthPrompt } from "@/features/public-feedback/components/FeedbackAuthPrompt";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function FeedbackPage() {
  const authenticated = useAuthStore((s) => s.authenticated);

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Votre avis compte</h1>
          <p className="text-muted-foreground">
            Aidez-nous à améliorer SantéProx en partageant votre expérience.
          </p>
        </div>

        {authenticated ? <PublicFeedbackForm /> : <FeedbackAuthPrompt />}
      </div>
    </PublicLayout>
  );
}
