"use client";

import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsService } from "../api/notifications.service";

export function WeeklyReminderButton() {
  const { mutate, isPending } = useMutation({
    mutationFn: () => notificationsService.triggerWeeklyReminder(),
    onSuccess: (data) => {
      toast.success(data.message || "Rappels envoyés");
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi des rappels");
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => mutate()}
      disabled={isPending}
    >
      <CalendarClock className="mr-2 h-4 w-4" />
      {isPending ? "Envoi..." : "Envoyer rappel hebdomadaire"}
    </Button>
  );
}
