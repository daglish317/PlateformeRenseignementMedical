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
        "group flex flex-col items-center gap-1.5 rounded-xl border bg-card px-1 py-2.5 text-center",
        "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
        emergency.color.border,
        selected && cn("ring-2", emergency.color.ring)
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          emergency.color.background
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
            emergency.color.icon
          )}
        />
      </div>

      <span className="text-[10px] font-semibold leading-tight text-foreground">
        {emergency.title}
      </span>
    </button>
  );
}
