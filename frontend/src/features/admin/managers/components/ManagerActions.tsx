"use client";

import { Eye, Ban, RotateCcw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ManagerAdmin } from "../types/manager";

interface ManagerActionsProps {
  manager: ManagerAdmin;
  onView: (manager: ManagerAdmin) => void;
  onSuspend: (manager: ManagerAdmin) => void;
  onReactivate: (manager: ManagerAdmin) => void;
  onResetPassword: (manager: ManagerAdmin) => void;
}

export function ManagerActions({
  manager,
  onView,
  onSuspend,
  onReactivate,
  onResetPassword,
}: ManagerActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(manager)}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {manager.is_active ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onSuspend(manager)}
          title="Suspendre"
          className="text-destructive hover:bg-destructive/10"
        >
          <Ban className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onReactivate(manager)}
          title="Réactiver"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onResetPassword(manager)}
        title="Réinitialiser le mot de passe"
      >
        <KeyRound className="h-4 w-4" />
      </Button>
    </div>
  );
}
