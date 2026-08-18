"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

import type { UserLocation } from "@/services/map/geolocalisation";
import { MAP } from "@/constants/map";
import { useSelectedStructure } from "@/store/search-store";

type MapControllerProps = {
  location?: UserLocation | null;
};

export default function MapController({
  location,
}: MapControllerProps) {
  const map = useMap();
  const selectedStructure = useSelectedStructure();

  useEffect(() => {
    if (!location) {
      return;
    }
    // Only fly to location if there's no selected structure yet
    if (!selectedStructure) {
      map.flyTo(
        [
          location.latitude,
          location.longitude,
        ],
        MAP.userZoom,
        {
          duration: MAP.flyTo.duration,
        }
      );
    }
  }, [location, map, selectedStructure]);

  useEffect(() => {
    if (selectedStructure && selectedStructure.latitude !== null && selectedStructure.longitude !== null) {
      map.flyTo(
        [
          selectedStructure.latitude,
          selectedStructure.longitude,
        ],
        MAP.userZoom,
        {
          duration: MAP.flyTo.duration,
        }
      );
    }
  }, [selectedStructure, map]);

  return null;
}
