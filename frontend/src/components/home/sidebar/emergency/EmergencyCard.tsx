import { ArrowRight } from "lucide-react";
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
        "group relative aspect-square overflow-hidden rounded-2xl border",
        "bg-card p-2.5 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        emergency.color.border,
        selected && cn("ring-2 shadow-xl", emergency.color.ring)
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          emergency.color.background
        )}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              "transition-all duration-300 group-hover:scale-110",
              emergency.color.background
            )}
          >
            <Icon className={cn("h-4 w-4", emergency.color.icon)} />
          </div>
        </div>

        <div className="pb-2 text-center">
          <h3 className="text-xs font-semibold tracking-tight text-foreground">
            {emergency.title}
          </h3>
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-[11px] font-medium text-primary">
          <span>Recherche rapide</span>
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}