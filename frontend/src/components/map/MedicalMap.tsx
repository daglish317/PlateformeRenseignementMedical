"use client";

import dynamic from "next/dynamic";
import { useEffect, memo, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import { usePositionWatcher } from "@/hooks/map/usePositionWatcher";
import MapControls from "./MapControls";
import MapSkeleton from "./MapSkeleton";
import { useLocation, useQuery, useResults, useSearchStore, useSelectedStructure } from "@/store/search-store";
import { useRoute } from "@/features/routing/hooks/useRoute";
import { useRoutingStore } from "@/features/routing/store/routing-store";

const UserMarker = dynamic(() => import("./UserMarker"), { ssr: false });
const StructureMarker = dynamic(() => import("./StructureMarker"), { ssr: false });

export type MapStructure = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  telephone: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  temps_marche_min?: number | null;
  temps_voiture_min?: number | null;
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const RouteLayer = dynamic(() => import("./RouteLayer"), { ssr: false });

// Composant message vide mémoïsé
const EmptyState = memo(() => {
  const t = useTranslations("map");
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[900] pointer-events-none">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-sm text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-3">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
          {t("noResultsTitle")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("noResultsText")}
        </p>
      </div>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

function MedicalMap() {
  // Position partagée via le store : la recherche (§21) et la carte restent synchronisées.
  const tMap = useTranslations("map");
  const location = useLocation();
  const selectedStructure = useSelectedStructure();
  const setLocation = useSearchStore((state) => state.setLocation);
  const { locateUser, error: locationError } = useCurrentLocation();
  const { calculateRouteAsync } = useRoute();
  const clearRoute = useRoutingStore((state) => state.clearRoute);

  // Suivi continu contrôlé (§21-26) : mise à jour uniquement après un
  // déplacement significatif, avec intervalle de repos.
  usePositionWatcher(true);

  const results = useResults();
  const query = useQuery();

  // La carte et la liste utilisent le même ensemble de données filtrées (§20).
  const structures = useMemo(
    () =>
      results?.map_results ?? (results?.results ?? []).map((item) => ({
        ...item.structure,
        distance_km: item.distance_km,
        temps_marche_min: item.temps_marche_min,
        temps_voiture_min: item.temps_voiture_min,
      })),
    [results]
  );

  const showEmptyState = query.trim().length > 0 && structures.length === 0 && results !== null;

  useEffect(() => {
    async function initializeLocation() {
      const position = await locateUser();
      if (position) {
        setLocation(position);
      }
    }
    initializeLocation();
  }, [locateUser, setLocation]);

  useEffect(() => {
    if (locationError) {
      toast.warning(tMap("locationUnavailable"));
    }
  }, [locationError, tMap]);

  useEffect(() => {
    if (!selectedStructure || !location) {
      clearRoute();
      return;
    }

    if (selectedStructure.latitude === null || selectedStructure.longitude === null) {
      clearRoute();
      return;
    }

    void calculateRouteAsync({
      startLat: location.latitude,
      startLng: location.longitude,
      endLat: selectedStructure.latitude,
      endLng: selectedStructure.longitude,
    });
  }, [selectedStructure, location, calculateRouteAsync, clearRoute]);

  return (
    <div className="relative h-full w-full">
      <MapView location={location} structures={structures}>
        {location && <UserMarker location={location} />}
        {structures.map((structure) => (
          <StructureMarker key={structure.id} structure={structure} />
        ))}
        <RouteLayer />
      </MapView>

      {showEmptyState && <EmptyState />}

      <MapControls onLocation={setLocation} />
    </div>
  );
}

// Mémoïser le composant entier
export default memo(MedicalMap);
