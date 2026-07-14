"use client";

import { MapContainer, TileLayer } from "react-leaflet";

import { MAP } from "@/constants/map";

import MapController from "./MapController";
import UserMarker from "./UserMarker";

import type { UserLocation } from "@/services/map/geolocalisation";


type MapViewProps = {
  location: UserLocation | null;
};


export default function MapView({
  location,
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
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />


      <MapController
        location={location}
      />


      {location && (
        <UserMarker
          location={location}
        />
      )}

    </MapContainer>
  );
}