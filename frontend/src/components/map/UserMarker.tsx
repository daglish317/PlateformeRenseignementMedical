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
        width: 44px;
        height: 44px;
        display:flex;
        align-items:center;
        justify-content:center;
      "
    >

      <div
        style="
          position:absolute;
          width:44px;
          height:44px;
          border-radius:9999px;
          background:rgba(22,163,74,0.28);
          animation:user-marker-pulse 2.4s ease-out infinite;
        "
      ></div>


      <div
        style="
          width:22px;
          height:22px;
          border-radius:9999px;
          background:#16a34a;
          border:4px solid white;
          box-shadow:
            0 4px 12px rgba(0,0,0,0.35);
          z-index:2;
        "
      ></div>

    </div>
  `,
  iconSize: [44,44],
  iconAnchor: [22,22],
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
        Vous êtes ici
      </Popup>

    </Marker>
  );
}