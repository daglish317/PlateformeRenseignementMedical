"use client";

import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export function ContactAuthPrompt() {
  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Connectez-vous pour me contacter</h3>
          <p className="text-muted-foreground">
            Vous devez avoir un compte pour m&apos;envoyer un message.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/inscription?returnTo=/contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Créer un compte
          </Link>
          <Link
            href="/connexion?returnTo=/contact"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
