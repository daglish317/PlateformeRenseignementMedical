"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CatalogueType } from "../types/catalog";

const typeConfig: Record<
  CatalogueType,
  { label: string; className: string }
> = {
  MALADIE: {
    label: "Maladie",
    className:
      "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  ANALYSE: {
    label: "Analyse",
    className:
      "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  EXAMEN: {
    label: "Examen",
    className:
      "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  SERVICE_MEDICAL: {
    label: "Service médical",
    className:
      "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

export function CatalogueTypeBadge({ type }: { type: CatalogueType }) {
  const config = typeConfig[type];
  return (
    <Badge className={cn("border-transparent", config.className)}>
      {config.label}
    </Badge>
  );
}
