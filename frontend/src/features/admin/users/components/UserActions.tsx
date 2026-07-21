"use client";

import { Eye, Ban, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserAdmin } from "../types/user";

interface UserActionsProps {
  user: UserAdmin;
  onView: (user: UserAdmin) => void;
  onSuspend: (user: UserAdmin) => void;
  onReactivate: (user: UserAdmin) => void;
  onDelete: (user: UserAdmin) => void;
}

export function UserActions({ user, onView, onSuspend, onReactivate, onDelete }: UserActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(user)}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {user.is_active ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onSuspend(user)}
          title="Suspendre"
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          <Ban className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onReactivate(user)}
          title="Réactiver"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(user)}
        title="Supprimer"
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
