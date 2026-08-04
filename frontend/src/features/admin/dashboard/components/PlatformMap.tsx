"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AdminSection } from "../../shared/components/AdminSection";
import MapControls from "@/components/map/MapControls";
import { getCurrentLocation } from "@/services/map/geolocalisation";
import type { UserLocation } from "@/services/map/geolocalisation";
import type { DashboardMapStructure } from "../types/dashboard";

const PlatformMapInner = dynamic(
  () => import("./PlatformMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-lg bg-muted/30">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    ),
  }
);

interface PlatformMapProps {
  structures: DashboardMapStructure[];
}

export function PlatformMap({ structures }: PlatformMapProps) {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then(setLocation)
      .catch(() => {
        // Position de l'admin indisponible : la carte reste utilisable.
      });
  }, []);

  return (
    <AdminSection className="p-0 overflow-hidden">
      <div className="border-b px-4 py-3 md:px-6">
        <h2 className="font-semibold">Carte de supervision</h2>
        <p className="text-sm text-muted-foreground">
          {structures.length} structure{structures.length > 1 ? "s" : ""} géolocalisée{structures.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="relative h-[360px]">
        <PlatformMapInner structures={structures} location={location} />
        <MapControls onLocation={setLocation} />
      </div>
    </AdminSection>
  );
}
