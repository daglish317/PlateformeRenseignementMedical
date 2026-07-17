import { LucideIcon, Brain, AlertTriangle, HeartPulse, Flame } from "lucide-react";
import type { Emergency } from "../types/emergency";

const icons: Record<string, LucideIcon> = {
  Brain,
  AlertTriangle,
  HeartPulse,
  Flame,
};

type EmergencyCardProps = {
  emergency: Emergency;
  onClick: (emergency: Emergency) => void;
};

export default function EmergencyCard({ emergency, onClick }: EmergencyCardProps) {
  const Icon = icons[emergency.icon] || AlertTriangle;

  return (
    <button
      onClick={() => onClick(emergency)}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center transition-all hover:bg-destructive/10"
    >
      <Icon className="h-8 w-8 text-destructive" />
      <span className="text-sm font-semibold text-destructive">{emergency.nom}</span>
    </button>
  );
}
