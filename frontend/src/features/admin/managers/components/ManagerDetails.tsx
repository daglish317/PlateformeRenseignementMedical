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
import { ManagerStatusBadge } from "./ManagerStatusBadge";
import type { ManagerAdmin } from "../types/manager";

interface ManagerDetailsProps {
  manager: ManagerAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManagerDetails({ manager, open, onOpenChange }: ManagerDetailsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Détails du gestionnaire</SheetTitle>
          <SheetDescription>
            Informations complètes sur le compte gestionnaire.
          </SheetDescription>
        </SheetHeader>

        {manager && (
          <div className="space-y-6 px-4 pb-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Nom</p>
                <p className="text-sm font-medium">{manager.nom}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{manager.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Statut</p>
                <div className="mt-1">
                  <ManagerStatusBadge isActive={manager.is_active} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Structure</p>
              {manager.structure ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom</p>
                    <p className="text-sm font-medium">{manager.structure.nom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm">
                      {manager.structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <p className="text-sm">{manager.structure.statut}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune structure assignée</p>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Activité</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Date d&apos;inscription</p>
                  <p className="text-sm">
                    {format(new Date(manager.date_joined), "dd MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dernière connexion</p>
                  <p className="text-sm">
                    {manager.last_login
                      ? format(new Date(manager.last_login), "dd MMMM yyyy 'à' HH:mm", {
                          locale: fr,
                        })
                      : "Jamais"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
