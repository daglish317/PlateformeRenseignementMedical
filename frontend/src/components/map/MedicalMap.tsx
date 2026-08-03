"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, memo } from "react";
import { toast } from "sonner";
import type { UserLocation } from "@/services/map/geolocalisation";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import MapControls from "./MapControls";
import MapSkeleton from "./MapSkeleton";
import { useResults, useQuery } from "@/store/search-store";

const UserMarker = dynamic(() => import("./UserMarker"), { ssr: false });
const StructureMarker = dynamic(() => import("./StructureMarker"), { ssr: false });

export type MapStructure = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  telephone?: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const RouteLayer = dynamic(() => import("./RouteLayer"), { ssr: false });

// Composant message vide mémoïsé
const EmptyState = memo(() => (
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
        Aucun résultat trouvé
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Aucun établissement correspondant à votre recherche.
      </p>
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

function MedicalMap() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const { locateUser, error: locationError } = useCurrentLocation();
  
  // Utiliser les sélecteurs optimisés
  const results = useResults();
  const query = useQuery();

  const structures = results?.results.map((item) => ({
    ...item.structure,
    distance_km: item.distance_km,
  })) ?? [];

  const showEmptyState = query.trim().length > 0 && structures.length === 0 && results !== null;

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

  // Afficher un message si les résultats contiennent une erreur
  useEffect(() => {
    if (results?.message) {
      toast.error(results.message);
    }
  }, [results?.message]);

  return (
    <div className="relative h-full w-full">
      <MapView location={location}>
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