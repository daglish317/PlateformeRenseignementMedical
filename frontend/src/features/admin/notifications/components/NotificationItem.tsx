"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useDeleteNotification } from "../hooks/useDeleteNotification";
import type { AdminNotification } from "../types/notification";

const typeBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  INFO: "default",
  ALERTE: "destructive",
  RAPPEL: "secondary",
  SYSTEME: "outline",
};

interface NotificationItemProps {
  notification: AdminNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        notification.est_lue ? "bg-muted/30 opacity-70" : "bg-card"
      }`}
    >
      <div className="mt-0.5">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{notification.titre}</h4>
          <Badge variant={typeBadgeVariant[notification.type] ?? "secondary"}>
            {notification.type}
          </Badge>
          {!notification.est_lue && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.contenu}
        </p>
        {notification.destinataire && (
          <p className="text-xs text-muted-foreground">
            À : {notification.destinataire.nom}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {format(new Date(notification.date_creation), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {!notification.est_lue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => markAsRead.mutate(notification.id)}
            title="Marquer comme lu"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => deleteNotification.mutate(notification.id)}
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
