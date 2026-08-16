"use client";

import {
  Building2,
  Hospital,
  Pill,
  Clock,
  UserCog,
  Users,
  MessageSquare,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "../types/dashboard";

interface StatConfig {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  color: string;
}

const statsConfig: StatConfig[] = [
  { key: "structures_total", label: "Structures", icon: Building2, color: "text-blue-600" },
  { key: "hopitaux", label: "Hôpitaux", icon: Hospital, color: "text-blue-600" },
  { key: "pharmacies", label: "Pharmacies", icon: Pill, color: "text-emerald-600" },
  { key: "structures_en_attente", label: "En attente", icon: Clock, color: "text-amber-600" },
  { key: "gestionnaires", label: "Gestionnaires", icon: UserCog, color: "text-purple-600" },
  { key: "utilisateurs_publics", label: "Utilisateurs", icon: Users, color: "text-cyan-600" },
  { key: "feedbacks_non_lus", label: "Feedbacks non lus", icon: MessageSquare, color: "text-orange-600" },
  { key: "messages_non_lus", label: "Messages non lus", icon: MessagesSquare, color: "text-indigo-600" },
];

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</p>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((config) => (
        <StatsCard
          key={config.key}
          label={config.label}
          value={stats[config.key]}
          icon={config.icon}
          color={config.color}
        />
      ))}
    </div>
  );
}
