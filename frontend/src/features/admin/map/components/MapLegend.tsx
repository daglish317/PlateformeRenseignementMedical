"use client";

export function MapLegend() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-blue-600 border border-white" />
        <span>Hôpital</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-emerald-600 border border-white" />
        <span>Pharmacie</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span>En attente</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span>Active</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span>Refusée</span>
      </div>
    </div>
  );
}
