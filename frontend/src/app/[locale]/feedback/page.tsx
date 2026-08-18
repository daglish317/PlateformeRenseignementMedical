"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { PublicFeedbackForm } from "@/features/public-feedback/components/PublicFeedbackForm";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

export default function FeedbackPage() {
  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <ProtectedRoute redirectTo="/inscription?returnTo=/feedback">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Votre avis compte</h1>
            <p className="text-muted-foreground">
              Aidez-nous à améliorer SantéProx en partageant votre expérience.
            </p>
          </div>

          <PublicFeedbackForm />
        </div>
      </ProtectedRoute>
    </PublicLayout>
  );
}
