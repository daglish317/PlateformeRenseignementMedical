"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserLocation } from "@/services/map/geolocalisation";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import MapControls from "./MapControls";
import { useSearchStore } from "@/store/search-store";

const UserMarker = dynamic(() => import("./UserMarker"), { ssr: false });
const StructureMarker = dynamic(() => import("./StructureMarker"), { ssr: false });

export type MapStructure = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  telephone?: string;
  latitude: number;
  longitude: number;
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/20">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  ),
});

const RouteLayer = dynamic(() => import("./RouteLayer"), { ssr: false });

export default function MedicalMap() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const { locateUser, error: locationError } = useCurrentLocation();
  const results = useSearchStore((state) => state.results);

  const structures = results?.results.map((item) => item.structure) ?? [];

  useEffect(() => {
    async function initializeLocation() {
      const position = await locateUser();
      if (position) {
        setLocation(position);
      }
    }
    initializeLocation();
  }, [locateUser]);

  useEffect(() => {
    if (locationError) {
      toast.warning("Géolocalisation non disponible. La carte est centrée par défaut.");
    }
  }, [locationError]);

  return (
    <div className="relative h-full w-full">
      <MapView location={location}>
        {location && <UserMarker location={location} />}
        {structures.map((structure) => (
          <StructureMarker key={structure.id} structure={structure} />
        ))}
        <RouteLayer />
      </MapView>

      <MapControls onLocation={setLocation} />
    </div>
  );
}
