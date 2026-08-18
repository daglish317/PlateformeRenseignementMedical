"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";
import type { UserLocation } from "@/services/map/geolocalisation";
import { MAP } from "@/constants/map";
import { useSelectedStructure } from "@/store/search-store";
import type { MapStructure } from "./MedicalMap";

type MapControllerProps = {
  location?: UserLocation | null;
  structures?: MapStructure[];
};

export default function MapController({
  location,
  structures = [],
}: MapControllerProps) {
  const map = useMap();
  const selectedStructure = useSelectedStructure();

  const structuresKey = structures
    .map((structure) => `${structure.id}:${structure.latitude}:${structure.longitude}`)
    .join("|");

  useEffect(() => {
    const points: [number, number][] = [];

    if (location) {
      points.push([location.latitude, location.longitude]);
    }

    if (
      selectedStructure?.latitude !== null &&
      selectedStructure?.latitude !== undefined &&
      selectedStructure?.longitude !== null &&
      selectedStructure?.longitude !== undefined
    ) {
      points.push([selectedStructure.latitude, selectedStructure.longitude]);
    } else {
      for (const structure of structures) {
        if (structure.latitude === null || structure.longitude === null) continue;
        points.push([structure.latitude, structure.longitude]);
      }
    }

    if (points.length === 0) return;

    if (points.length === 1) {
      const [lat, lng] = points[0];
      map.flyTo([lat, lng], MAP.userZoom, {
        duration: MAP.flyTo.duration,
      });
      return;
    }

    map.fitBounds(points, {
      animate: true,
      duration: MAP.flyTo.duration,
      padding: [56, 56],
      maxZoom: selectedStructure ? MAP.structureZoom : MAP.userZoom,
    });
  }, [
    location,
    map,
    selectedStructure,
    structures,
    structuresKey,
  ]);

  return null;
}
