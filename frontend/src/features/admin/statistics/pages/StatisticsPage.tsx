"use client";

import dynamic from "next/dynamic";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { AdminLoading } from "../../shared/components/AdminLoading";
import { AdminError } from "../../shared/components/AdminError";
import { useStatistics } from "../hooks/useStatistics";
import { StatisticsPeriod } from "../components/StatisticsPeriod";
import { StatisticsCardsGrid } from "../components/StatisticsCards";
import { TopSearches } from "../components/TopSearches";
import { PopularStructures } from "../components/PopularStructures";

const StatisticsCharts = dynamic(
  () => import("../components/StatisticsCharts").then((mod) => mod.StatisticsCharts),
  {
    ssr: false,
    loading: () => <div className="h-[220px] rounded-xl bg-muted/30" />,
  }
);

export function StatisticsPage() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) {
    return <AdminLoading label="Chargement des statistiques..." />;
  }

  if (isError || !data) {
    return (
      <AdminError
        message="Impossible de charger les statistiques."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Statistiques"
        subtitle="Analyse de l'activité de la plateforme"
      />

      <StatisticsPeriod />

      <StatisticsCardsGrid cards={data.cards} isLoading={isLoading} />

      <StatisticsCharts charts={data.charts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopSearches data={data.top_searches} />
        <PopularStructures data={data.popular_structures} />
      </div>
    </div>
  );
}
