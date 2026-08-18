"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { ContactForm } from "@/features/public-contact/components/ContactForm";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

export default function ContactPage() {
  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <ProtectedRoute redirectTo="/inscription?returnTo=/contact">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>

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
