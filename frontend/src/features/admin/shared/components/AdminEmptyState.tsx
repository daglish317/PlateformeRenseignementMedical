"use client";

import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  title?: string;
  description?: string;
}

export function AdminEmptyState({
  title = "Aucun résultat",
  description = "Aucune donnée à afficher pour le moment.",
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground" />
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
