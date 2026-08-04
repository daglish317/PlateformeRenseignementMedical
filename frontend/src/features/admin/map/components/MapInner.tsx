"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MapView from "@/components/map/MapView";
import UserMarker from "@/components/map/UserMarker";
import { Badge } from "@/components/ui/badge";
import type { AdminMapStructure } from "../types/map";
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

const statutBadgeVariant: Record<string, "warning" | "success" | "destructive"> = {
  EN_ATTENTE: "warning",
  ACTIVE: "success",
  REFUSEE: "destructive",
};

const statutLabel: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACTIVE: "Active",
  REFUSEE: "Refusée",
};

interface MapInnerProps {
  structures: AdminMapStructure[];
  location?: UserLocation | null;
  zoomControl?: boolean;
}

export default function MapInner({ structures, location, zoomControl = false }: MapInnerProps) {
  return (
    <MapView location={location} zoomControl={zoomControl}>
      {location && <UserMarker location={location} />}
      {structures
        .filter((s) => s.latitude !== null && s.longitude !== null)
        .map((structure) => {
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
                  {structure.telephone && (
                    <p className="text-xs text-muted-foreground">{structure.telephone}</p>
                  )}
                  <Badge variant={statutBadgeVariant[structure.statut] ?? "secondary"}>
                    {statutLabel[structure.statut] ?? structure.statut}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapView>
  );
}
