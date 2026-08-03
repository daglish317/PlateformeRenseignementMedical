"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import { ContactForm } from "@/features/public-contact/components/ContactForm";
import { ContactAuthPrompt } from "@/features/public-contact/components/ContactAuthPrompt";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function ContactPage() {
  const authenticated = useAuthStore((s) => s.authenticated);

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Me contacter</h1>
          <p className="text-muted-foreground">
            Un projet, une question, une idée ? Parlons-en directement sur
            WhatsApp.
          </p>
        </div>

        {authenticated ? <ContactForm /> : <ContactAuthPrompt />}
      </div>
    </PublicLayout>
  );
}
