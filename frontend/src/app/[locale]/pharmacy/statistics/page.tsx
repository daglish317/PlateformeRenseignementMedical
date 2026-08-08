"use client";
import { Lock } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";

export default function PharmacyStatisticsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Statistiques"
        subtitle="Analyse de l'activité de votre pharmacie"
      />
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <Lock className="h-8 w-8" />
        <p className="text-sm">
          Les statistiques financières sont réservées au propriétaire de la
          structure.
        </p>
      </div>
    </div>
  );
}
