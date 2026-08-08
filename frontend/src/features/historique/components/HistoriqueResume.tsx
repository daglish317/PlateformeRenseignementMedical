"use client";
import { CalendarClock, Package, Undo2, ClipboardList } from "lucide-react";
import { ResumeHistorique } from "../types/historique";
import { cn } from "@/lib/utils";

interface HistoriqueResumeProps {
  resume: ResumeHistorique;
  className?: string;
}

export function HistoriqueResume({ resume, className }: HistoriqueResumeProps) {
  const elements = [
    {
      label: "Événements aujourd'hui",
      valeur: resume.evenements_aujourdhui,
      icon: CalendarClock,
      classe: "text-primary",
    },
    {
      label: "Approvisionnements",
      valeur: resume.approvisionnements,
      icon: Package,
      classe: "text-muted-foreground",
    },
    {
      label: "Retours caisse",
      valeur: resume.retours_caisse,
      icon: Undo2,
      classe: "text-warning",
    },
    {
      label: "Inventaires générés",
      valeur: resume.inventaires_generes,
      icon: ClipboardList,
      classe: "text-success",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4",
        className
      )}
    >
      {elements.map(({ label, valeur, icon: Icon, classe }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <div className={cn("shrink-0", classe)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none">{valeur}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
