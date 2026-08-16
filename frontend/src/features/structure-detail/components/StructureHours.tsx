"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StructureDetail } from "../types/structure-detail";
import { cn } from "@/lib/utils";

type StructureHoursProps = {
  structure: StructureDetail;
};

function jourLabel(jour: string): string {
  return jour.charAt(0) + jour.slice(1).toLowerCase();
}

export default function StructureHours({ structure }: StructureHoursProps) {
  const t = useTranslations("structure");
  const horaires = structure.horaires ?? [];

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t("hoursTitle")}</h2>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
            structure.est_ouverte
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              structure.est_ouverte ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          {structure.est_ouverte ? t("open") : t("closed")}
        </span>
      </div>

      {horaires.length > 0 ? (
        <div className="space-y-4">
          {horaires.map((horaire) => (
            <div
              key={horaire.jour}
              className="flex items-start justify-between border-b border-border py-3 last:border-0"
            >
              <span className="font-medium text-foreground">
                {jourLabel(horaire.jour)}
              </span>
              <span
                className={cn(
                  "text-right text-muted-foreground",
                  horaire.est_ferme && "font-medium text-foreground"
                )}
              >
                {horaire.est_ferme || horaire.plages.length === 0
                  ? t("closed")
                  : horaire.plages.map((plage, index) => (
                      <span key={index} className="block">
                        {plage.ouverture} — {plage.fermeture}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-muted-foreground">{t("hoursUnavailable")}</p>
      )}
    </section>
  );
}
