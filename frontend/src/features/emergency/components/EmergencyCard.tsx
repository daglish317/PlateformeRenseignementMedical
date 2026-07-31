"use client";

import { cn } from "@/lib/utils";
import type { EmergencyItem } from "@/constants/emergency";

type EmergencyCardProps = {
  emergency: EmergencyItem;
  selected?: boolean;
  onClick?: (id: EmergencyItem["id"]) => void;
};

export default function EmergencyCard({
  emergency,
  selected = false,
  onClick,
}: EmergencyCardProps) {
  const Icon = emergency.icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(emergency.id)}
     className={cn(
  "group flex items-center gap-1.5 rounded-lg border px-2 py-1.5",
  "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm",
  emergency.color.background,
  emergency.color.border,
  selected && cn("ring-2", emergency.color.ring)
)}
    >
      <Icon
        className={cn(
          "mb-1 h-4 w-4 transition-transform duration-200",
          emergency.color.icon,
          "group-hover:scale-110"
        )}
      />

      <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground">
        {emergency.title.length > 5
          ? emergency.title.substring(0, 5)
          : emergency.title}
      </span>
    </button>
  );
}