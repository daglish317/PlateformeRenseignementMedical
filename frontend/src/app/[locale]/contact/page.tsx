"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { ContactForm } from "@/features/public-contact/components/ContactForm";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

export default function ContactPage() {
  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <ProtectedRoute redirectTo="/inscription?returnTo=/contact">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Me contacter</h1>
            <p className="text-muted-foreground">
              Un projet, une question, une idée ? Parlons-en directement sur
              WhatsApp.
            </p>
          </div>

          <ContactForm />
        </div>
      </ProtectedRoute>
    </PublicLayout>
  );
}
