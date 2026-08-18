
"use client";

import { ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { MAP } from "@/constants/map";
import MapController from "./MapController";
import type { MapStructure } from "./MedicalMap";
import type { UserLocation } from "@/services/map/geolocalisation";

type MapViewProps = {
  children?: ReactNode;
  location?: UserLocation | null;
  structures?: MapStructure[];
  zoomControl?: boolean;
};

// OpenStreetMap Standard - Affiche TOUT:
// - Bâtiments
// - Routes et chemins
// - Parcs et espaces verts
// - Commerces et entreprises
// - Points d'intérêt (restaurants, hôpitaux, écoles, etc.)
// - Transports en commun
// - Limites administratives
// Comme Google Maps avec tous les détails
const TILES_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function MapView({
  children,
  location,
  structures = [],
  zoomControl = false,
}: MapViewProps) {
  return (
    <MapContainer
      center={[
        MAP.defaultCenter.lat,
        MAP.defaultCenter.lng,
      ]}
      zoom={MAP.defaultZoom}
      minZoom={MAP.minZoom}
      maxZoom={MAP.maxZoom}
      zoomControl={zoomControl}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key="osm-standard"
        url={TILES_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapController
        location={location}
        structures={structures}
      />

      {children}
    </MapContainer>
  );
}
