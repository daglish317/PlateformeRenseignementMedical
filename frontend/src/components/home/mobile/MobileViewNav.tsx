"use client";

import { Map as MapIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileView = "recherche" | "carte";

type MobileViewNavProps = {
  view: MobileView;
  onViewChange: (view: MobileView) => void;
};

const items = [
  { id: "recherche" as const, label: "Recherche", icon: Search },
  { id: "carte" as const, label: "Carte", icon: MapIcon },
];

export default function MobileViewNav({
  view,
  onViewChange,
}: MobileViewNavProps) {
  return (
    <nav
      aria-label="Navigation"
      className="fixed bottom-5 left-1/2 z-[1100] -translate-x-1/2 md:hidden"
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-white/85 p-1 shadow-lg shadow-black/10 backdrop-blur-md dark:bg-card/85">
        {items.map(({ id, label, icon: Icon }) => {
          const active = view === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
