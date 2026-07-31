
"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useTheme } from "next-themes";

import { MAP } from "@/constants/map";
import MapController from "./MapController";
import type { UserLocation } from "@/services/map/geolocalisation";

type MapViewProps = {
  children?: ReactNode;
  location?: UserLocation | null;
};

// Voyager = même fournisseur (CARTO) que l'ancien "light_all", mais avec les
// routes, parcs et plans d'eau en couleur — c'est ce qui donne le rendu
// "Google Maps" au lieu du fond gris/blanc plat.
const LIGHT_TILES = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

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
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const tileUrl = isDark ? DARK_TILES : LIGHT_TILES;

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
        key={isDark ? "dark" : "voyager"}
        url={tileUrl}
        attribution="© OpenStreetMap contributors © CARTO"
      />

      <MapController
        location={location}
      />

      {children}
    </MapContainer>
  );
}