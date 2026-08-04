"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MapView from "@/components/map/MapView";
import UserMarker from "@/components/map/UserMarker";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { DashboardMapStructure } from "../types/dashboard";
import type { UserLocation } from "@/services/map/geolocalisation";

const hopitalIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">H</div>`,
  iconSize: [24, 24],
});

const pharmacieIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">P</div>`,
  iconSize: [24, 24],
});

interface PlatformMapInnerProps {
  structures: DashboardMapStructure[];
  location?: UserLocation | null;
}

export default function PlatformMapInner({ structures, location }: PlatformMapInnerProps) {
  return (
    <MapView location={location} zoomControl>
      {location && <UserMarker location={location} />}
      {structures.map((structure) => {
        const icon = structure.type === "HOPITAL" ? hopitalIcon : pharmacieIcon;

        return (
          <Marker
            key={structure.id}
            position={[structure.latitude, structure.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="space-y-2 min-w-[180px]">
                <h3 className="font-semibold">{structure.nom}</h3>
                <p className="text-sm text-muted-foreground">
                  {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
                </p>
                <p className="text-sm">{structure.adresse}</p>
                <Button size="sm" className="w-full" render={<Link href="/admin/structures" />}>
                  Voir la structure
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapView>
  );
}
