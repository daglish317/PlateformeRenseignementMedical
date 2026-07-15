"use client";

import { MapContainer, TileLayer } from "react-leaflet";

import { MAP } from "@/constants/map";

import MapController from "./MapController";
import UserMarker from "./UserMarker";
import StructureMarker from "./StructureMarker";

import type { UserLocation } from "@/services/map/geolocalisation";
import type { MapStructure } from "./MedicalMap";


type MapViewProps = {
  location: UserLocation | null;
  structures: MapStructure[];
};



export default function MapView({
  location,
  structures,
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



      {structures.map((structure) => (
        <StructureMarker
          key={structure.id}
          structure={structure}
        />
      ))}


    </MapContainer>
  );
}