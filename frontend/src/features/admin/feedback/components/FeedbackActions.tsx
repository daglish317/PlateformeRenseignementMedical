"use client";

import { Eye, MailOpen, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackAdmin } from "../types/feedback";

interface FeedbackActionsProps {
  feedback: FeedbackAdmin;
  onView: (feedback: FeedbackAdmin) => void;
  onMarkRead: (id: string) => void;
  onMarkTreated: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FeedbackActions({
  feedback,
  onView,
  onMarkRead,
  onMarkTreated,
  onDelete,
}: FeedbackActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(feedback)}
        title="Voir les détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {feedback.statut === "NON_LU" && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMarkRead(feedback.id)}
          title="Marquer comme lu"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <MailOpen className="h-4 w-4" />
        </Button>
      )}
      {feedback.statut !== "TRAITE" && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onMarkTreated(feedback.id)}
          title="Marquer comme traité"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(feedback.id)}
        title="Supprimer"
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
