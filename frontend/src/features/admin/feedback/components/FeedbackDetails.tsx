"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FeedbackStatusBadge } from "./FeedbackStatusBadge";
import { FeedbackCategoryBadge } from "./FeedbackCategoryBadge";
import type { FeedbackAdmin } from "../types/feedback";

interface FeedbackDetailsProps {
  feedback: FeedbackAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDetails({ feedback, open, onOpenChange }: FeedbackDetailsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Détails du feedback</SheetTitle>
          <SheetDescription>
            Informations complètes sur le feedback.
          </SheetDescription>
        </SheetHeader>

        {feedback && (
          <div className="space-y-6 px-4 pb-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Utilisateur</p>
                <p className="text-sm font-medium">{feedback.utilisateur_nom}</p>
                <p className="text-sm text-muted-foreground">{feedback.utilisateur_email}</p>
              </div>
              {feedback.structure && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Structure</p>
                  <p className="text-sm">{feedback.structure}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Catégorie</p>
                <div className="mt-1">
                  <FeedbackCategoryBadge categorie={feedback.categorie} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Statut</p>
                <div className="mt-1">
                  <FeedbackStatusBadge statut={feedback.statut} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Sujet</p>
                <p className="text-sm font-medium">{feedback.sujet}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Message</p>
              <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Date de création
              </p>
              <p className="text-sm">
                {format(new Date(feedback.date_creation), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
