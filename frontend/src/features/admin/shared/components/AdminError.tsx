"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function AdminError({
  message = "Une erreur est survenue.",
  onRetry,
}: AdminErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
