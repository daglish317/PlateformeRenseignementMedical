
"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { MAP } from "@/constants/map";
import MapController from "./MapController";
import type { UserLocation } from "@/services/map/geolocalisation";

type MapViewProps = {
  children?: ReactNode;
  location?: UserLocation | null;
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

// Remplace le pattern useState+useEffect(setMounted(true)) : on ne "set" jamais
// d'état dans un effet, on synchronise avec un store externe qui n'a qu'une
// seule valeur possible côté client, et une autre côté serveur.
function noopSubscribe() {
  return () => {};
}
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,   // snapshot côté client
    () => false   // snapshot côté serveur (SSR)
  );
}

export default function MapView({
  children,
  location,
}: MapViewProps) {
  const mounted = useMounted();

  return (
    <MapContainer
      center={[
        MAP.defaultCenter.lat,
        MAP.defaultCenter.lng,
      ]}
      zoom={MAP.defaultZoom}
      minZoom={MAP.minZoom}
      maxZoom={MAP.maxZoom}
      zoomControl={false}
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
      />

      {children}
    </MapContainer>
  );
}