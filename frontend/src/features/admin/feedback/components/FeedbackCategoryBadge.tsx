"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeedbackCategorie } from "../types/feedback";

const categoryConfig: Record<FeedbackCategorie, { label: string; className?: string; variant?: "destructive" | "secondary" }> = {
  BUG: { label: "Bug", variant: "destructive" },
  SUGGESTION: { label: "Suggestion", className: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  SIGNALEMENT: { label: "Signalement", className: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  AUTRE: { label: "Autre", variant: "secondary" },
};

export function FeedbackCategoryBadge({ categorie }: { categorie: FeedbackCategorie }) {
  const config = categoryConfig[categorie];
  return (
    <Badge
      variant={config.variant}
      className={cn(config.variant === undefined && "border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}
