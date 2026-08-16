"use client";

import {
  Search,
  Users,
  UserCog,
  Building2,
  Hospital,
  Pill,
  MessageSquare,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatisticsCards as StatisticsCardsType } from "../types/statistics";

interface CardConfig {
  key: keyof StatisticsCardsType;
  label: string;
  icon: LucideIcon;
  color: string;
}

const cardsConfig: CardConfig[] = [
  { key: "recherches_total", label: "Recherches", icon: Search, color: "text-blue-600" },
  { key: "utilisateurs_inscrits", label: "Utilisateurs inscrits", icon: Users, color: "text-cyan-600" },
  { key: "gestionnaires", label: "Gestionnaires", icon: UserCog, color: "text-purple-600" },
  { key: "structures", label: "Structures", icon: Building2, color: "text-blue-600" },
  { key: "hopitaux", label: "Hôpitaux", icon: Hospital, color: "text-blue-600" },
  { key: "pharmacies", label: "Pharmacies", icon: Pill, color: "text-emerald-600" },
  { key: "feedbacks", label: "Feedbacks", icon: MessageSquare, color: "text-orange-600" },
  { key: "messages", label: "Messages", icon: MessagesSquare, color: "text-indigo-600" },
];

interface StatisticsCardItemProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

function StatisticsCardItem({ label, value, icon: Icon, color }: StatisticsCardItemProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</p>
      </CardContent>
    </Card>
  );
}

function StatisticsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface StatisticsCardsGridProps {
  cards?: StatisticsCardsType;
  isLoading: boolean;
}

export function StatisticsCardsGrid({ cards, isLoading }: StatisticsCardsGridProps) {
  if (isLoading || !cards) {
    return <StatisticsCardsSkeleton />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardsConfig.map((config) => (
        <StatisticsCardItem
          key={config.key}
          label={config.label}
          value={cards[config.key]}
          icon={config.icon}
          color={config.color}
        />
      ))}
    </div>
  );
}
