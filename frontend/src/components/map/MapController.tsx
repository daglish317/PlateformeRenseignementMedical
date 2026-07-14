"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

import type { UserLocation } from "@/services/map/geolocalisation";

import { MAP } from "@/constants/map";


type MapControllerProps = {
  location?: UserLocation | null;
};


export default function MapController({
  location,
}: MapControllerProps) {

  const map = useMap();


  useEffect(() => {

    if (!location) {
      return;
    }


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

  }, [location, map]);


  return null;
}