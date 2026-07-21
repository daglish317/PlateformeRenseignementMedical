"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { AdminLoading } from "../../shared/components/AdminLoading";
import { AdminError } from "../../shared/components/AdminError";
import { AdminEmptyState } from "../../shared/components/AdminEmptyState";
import { useStructuresMap } from "../hooks/useStructuresMap";
import { useMapStore } from "../store/map-store";
import { MapFilters } from "../components/MapFilters";
import { MapLegend } from "../components/MapLegend";

const MapInner = dynamic(() => import("../components/MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted/30">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  ),
});

export function MapPage() {
  const { data, isLoading, isError, refetch } = useStructuresMap();
  const filters = useMapStore((s) => s.filters);

  const structures = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((s) => {
      if (filters.type && s.type !== filters.type) return false;
      if (filters.statut && s.statut !== filters.statut) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.nom.toLowerCase().includes(q) && !s.adresse.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [data?.results, filters]);

  if (isLoading) {
    return <AdminLoading label="Chargement de la carte..." />;
  }

  if (isError) {
    return (
      <AdminError
        message="Impossible de charger les structures."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Carte de supervision"
        subtitle="Visualisation interactive de toutes les structures"
      />

      <MapFilters />

      {structures.length === 0 ? (
        <AdminEmptyState
          title="Aucune structure"
          description="Aucune structure ne correspond aux filtres sélectionnés."
        />
      ) : (
        <>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="h-[500px]">
              <MapInner structures={structures} />
            </div>
          </div>
          <MapLegend />
          <p className="text-sm text-muted-foreground">
            {structures.length} structure{structures.length > 1 ? "s" : ""} affichée{structures.length > 1 ? "s" : ""}
          </p>
        </>
      )}
    </div>
  );
}
