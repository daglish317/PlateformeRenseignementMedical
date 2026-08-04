"use client";

import dynamic from "next/dynamic";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { AdminLoading } from "../../shared/components/AdminLoading";
import { AdminError } from "../../shared/components/AdminError";
import { useDashboard } from "../hooks/useDashboard";
import { StatsCards } from "../components/StatsCards";
import { PendingStructures } from "../components/PendingStructures";
import { RecentActivity } from "../components/RecentActivity";

const PlatformMap = dynamic(
  () => import("../components/PlatformMap").then((mod) => mod.PlatformMap),
  {
    ssr: false,
    loading: () => <div className="h-[360px] rounded-xl bg-muted/30" />,
  }
);

const DashboardCharts = dynamic(
  () => import("../components/DashboardCharts").then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => <div className="h-[260px] rounded-xl bg-muted/30" />,
  }
);

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return <AdminLoading label="Chargement du tableau de bord..." />;
  }

  if (isError || !data) {
    return (
      <AdminError
        message="Impossible de charger les données du tableau de bord."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Tableau de bord"
        subtitle="Vue synthétique de la plateforme SantéProx"
      />

      <StatsCards stats={data.stats} />

      <PlatformMap structures={data.map_structures} />

      <DashboardCharts charts={data.charts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PendingStructures structures={data.pending_structures} />
        <RecentActivity activities={data.recent_activity} />
      </div>
    </div>
  );
}
