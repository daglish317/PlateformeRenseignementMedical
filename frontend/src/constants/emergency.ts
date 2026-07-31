
import { Brain, AlertTriangle, HeartPulse, Flame, type LucideIcon } from "lucide-react";

export type EmergencyType = "AVC" | "ACCIDENT" | "CARDIAQUE" | "BRULURE";

export type EmergencyItem = {
  id: EmergencyType;
  title: string;
  icon: LucideIcon;
  color: {
    background: string; // fond de la tuile (état repos + hover)
    border: string;      // bordure de la card
    icon: string;         // couleur de l'icône
    ring: string;         // anneau de sélection
  };
};

// Chaque urgence a sa propre couleur sémantique : on ne réutilise jamais
// la même teinte, pour que l'oeil identifie le module avant même de lire le texte.
export const emergencies: EmergencyItem[] = [
  {
    id: "AVC",
    title: "AVC",
    icon: Brain,
    color: {
     background: "bg-violet-500/10 dark:bg-violet-500/20",
      border: "border-violet-200 dark:border-violet-500/30",
      icon: "text-violet-600 dark:text-violet-400",
      ring: "ring-violet-400",
    },
    
  },
  {
    id: "ACCIDENT",
    title: "Accident",
    icon: AlertTriangle,
    color: {
      background: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-200 dark:border-amber-500/30",
      icon: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-400",
    },
  },
  {
    id: "CARDIAQUE",
    title: "Cardiaque",
    icon: HeartPulse,
    color: {
      background: "bg-red-500/10 dark:bg-red-500/20",
      border: "border-rose-200 dark:border-rose-500/30",
      icon: "text-rose-600 dark:text-rose-400",
      ring: "ring-rose-400",
    },
  },
  {
    id: "BRULURE",
    title: "Brûlure",
    icon: Flame,
    color: {
      background: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-200 dark:border-orange-500/30",
      icon: "text-orange-600 dark:text-orange-400",
      ring: "ring-orange-400",
    },
  },
];