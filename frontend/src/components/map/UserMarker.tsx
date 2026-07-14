"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

import type { UserLocation } from "@/services/map/geolocalisation";



type UserMarkerProps = {
  location: UserLocation;
};



const userIcon = L.divIcon({
  className: "",
  html: `
    <div
      style="
        position: relative;
        width: 42px;
        height: 42px;
        display:flex;
        align-items:center;
        justify-content:center;
      "
    >

      <div
        style="
          position:absolute;
          width:42px;
          height:42px;
          border-radius:9999px;
          background:rgba(37,99,235,0.20);
          animation:pulse 2s infinite;
        "
      ></div>


      <div
        style="
          width:22px;
          height:22px;
          border-radius:9999px;
          background:#2563eb;
          border:4px solid white;
          box-shadow:
            0 4px 12px rgba(0,0,0,0.35);
          z-index:2;
        "
      ></div>

    </div>
  `,
  iconSize: [42,42],
  iconAnchor: [21,21],
});


export default function UserMarker({
  location,
}: UserMarkerProps) {

  return (
    <Marker
      position={[
        location.latitude,
        location.longitude,
      ]}
      icon={userIcon}
    >

      <Popup>
        Votre position actuelle
      </Popup>

    </Marker>
  );
}