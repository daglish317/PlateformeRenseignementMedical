"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { AdminSection } from "../../shared/components/AdminSection";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import type { DashboardActivity } from "../types/dashboard";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  structure_created: Building2,
  structure_validated: CheckCircle,
  structure_rejected: XCircle,
  user_created: UserPlus,
  feedback_created: MessageSquare,
};

interface RecentActivityProps {
  activities: DashboardActivity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <AdminSection>
      <h2 className="mb-4 font-semibold">Activité récente</h2>

      {activities.length === 0 ? (
        <AdminEmptyState
          title="Aucune activité"
          description="Les dernières actions apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type] ?? Building2;

            return (
              <div
                key={`${activity.type}-${activity.date}-${index}`}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{activity.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminSection>
  );
}
