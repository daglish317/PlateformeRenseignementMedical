"use client";

export default function MapSkeleton() {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-muted/20"
      aria-busy="true"
      aria-label="Chargement de la carte"
    >
      {/* Trame de "rues" */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.55 0.04 240 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.55 0.04 240 / 0.25) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Taches "espaces verts / plans d'eau" */}
      <div className="absolute left-[12%] top-[18%] h-24 w-40 rounded-2xl bg-emerald-400/10 dark:bg-emerald-400/10" />
      <div className="absolute bottom-[20%] right-[10%] h-32 w-56 rounded-3xl bg-sky-400/10 dark:bg-sky-400/10" />

      {/* Axes "routes" */}
      <div className="absolute left-0 top-1/3 h-9 w-full -rotate-3 bg-muted/80 dark:bg-muted/50" />
      <div className="absolute left-1/3 top-0 h-full w-12 -rotate-6 bg-muted/80 dark:bg-muted/50" />

      {/* Shimmer */}
      <div className="map-shimmer absolute inset-0" />

      {/* Point de centrage */}
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-muted-foreground/40" />
    </div>
  );
}
