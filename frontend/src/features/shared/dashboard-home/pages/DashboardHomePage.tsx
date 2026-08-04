"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "../../dashboard/components/PageContainer";
import { PageTitle } from "../../dashboard/components/PageTitle";
import { useDashboardHome } from "../hooks/useDashboardHome";
import { WelcomeCard } from "../components/WelcomeCard";
import { StatisticsCards } from "../components/StatisticsCards";
import { QuickActions } from "../components/QuickActions";
import { StatusCard } from "../components/StatusCard";
import { RecentActivity } from "../components/RecentActivity";
import type { StructureType } from "../types/dashboard-home";

interface DashboardHomePageProps {
  type: StructureType;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[100px] w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[160px] rounded-xl" />
        <Skeleton className="h-[160px] rounded-xl" />
      </div>
      <Skeleton className="h-[200px] rounded-xl" />
    </div>
  );
}

export function DashboardHomePage({ type }: DashboardHomePageProps) {
  const { data, isLoading, error, refetch, isFetching } = useDashboardHome();

  return (
    <PageContainer>
      <div className="mb-6">
        <PageTitle
          title="Tableau de bord"
          subtitle={
            type === "HOPITAL" ? "Gestion de votre hôpital" : "Gestion de votre pharmacie"
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Une erreur est survenue lors du chargement des données.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <WelcomeCard
            structureName={data.structure.nom}
            structureType={data.structure.type}
            statut={data.structure.statut}
          />

          <StatisticsCards stats={data.stats} type={type} />

          <div className="grid gap-6 lg:grid-cols-2">
            <QuickActions type={type} />
            <StatusCard structure={data.structure} />
          </div>

          <RecentActivity activities={data.recent_activity} />
        </div>
      ) : null}
    </PageContainer>
  );
}
