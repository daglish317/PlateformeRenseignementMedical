"use client";
import { Bell, AlertTriangle, Eye, CheckCircle2 } from "lucide-react";
import { ResumeAlertes } from "../types/alerte";
import { cn } from "@/lib/utils";

interface AlerteResumeProps {
  resume: ResumeAlertes;
  className?: string;
}

export function AlerteResume({ resume, className }: AlerteResumeProps) {
  const elements = [
    {
      label: "Alertes",
      valeur: resume.total,
      icon: Bell,
      classe: "text-primary",
    },
    {
      label: "Critiques",
      valeur: resume.critiques,
      icon: AlertTriangle,
      classe: "text-destructive",
    },
    {
      label: "Non lues",
      valeur: resume.non_lues,
      icon: Eye,
      classe: "text-warning",
    },
    {
      label: "Résolues",
      valeur: resume.resolues,
      icon: CheckCircle2,
      classe: "text-success",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
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
