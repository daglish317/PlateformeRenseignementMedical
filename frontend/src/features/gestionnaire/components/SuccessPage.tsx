"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";
import confetti from "canvas-confetti";

export function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#1a73e8", "#34a853", "#fbbc04", "#ea4335"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#1a73e8", "#34a853", "#fbbc04", "#ea4335"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Félicitations !
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vos informations ont été envoyées avec succès. Veuillez patienter,
          vos informations seront validées par l&apos;administrateur et vous
          recevrez un email après l&apos;activation de votre compte.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4 text-left text-sm">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">En attente de validation</p>
            <p className="text-muted-foreground">
              L&apos;administrateur examinera votre demande dans les plus brefs délais.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Email de confirmation</p>
            <p className="text-muted-foreground">
              Vous recevrez un email une fois votre compte activé.
            </p>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={() => router.push("/gestionnaire")}
      >
        Retour au tableau de bord
      </Button>
    </div>
  );
}
