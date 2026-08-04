"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { useStructuresMap } from "../hooks/useStructuresMap";
import { useMapStore } from "../store/map-store";
import { MapFilters } from "../components/MapFilters";
import { MapLegend } from "../components/MapLegend";
import MapControls from "@/components/map/MapControls";
import { getCurrentLocation } from "@/services/map/geolocalisation";
import type { UserLocation } from "@/services/map/geolocalisation";

const MapInner = dynamic(() => import("../components/MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/30">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  ),
});

export function MapPage() {
  const { data: structures, isLoading, isError, refetch } = useStructuresMap();
  const filters = useMapStore((s) => s.filters);
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then(setLocation)
      .catch(() => {
        // Position de l'admin indisponible : la carte reste utilisable.
      });
  }, []);

  const filteredStructures = useMemo(() => {
    if (!structures) return [];
    return structures.filter((s) => {
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
  }, [structures, filters]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Carte de supervision"
        subtitle="Visualisation interactive de toutes les structures"
      />

      <MapFilters />

      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="relative h-[500px]">
          <MapInner
            structures={filteredStructures}
            location={location}
            zoomControl
          />

          <MapControls onLocation={setLocation} />

          {isLoading && (
            <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-muted/40">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Chargement des structures...
                </span>
              </div>
            </div>
          )}

          {isError && (
            <div className="absolute left-1/2 top-3 z-[1100] w-[calc(100%-1.5rem)] -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-sm backdrop-blur">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                  Impossible de charger les structures.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Réessayer
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !isError && filteredStructures.length === 0 && (
            <div className="absolute left-1/2 top-3 z-[1100] w-[calc(100%-1.5rem)] -translate-x-1/2">
              <div className="rounded-lg border bg-card px-4 py-2 text-center text-sm text-muted-foreground shadow-sm">
                Aucune structure ne correspond aux filtres.
              </div>
            </div>
          )}
        </div>
      </div>

      <MapLegend />

      <p className="text-sm text-muted-foreground">
        {filteredStructures.length} structure{filteredStructures.length > 1 ? "s" : ""} affichée{filteredStructures.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
