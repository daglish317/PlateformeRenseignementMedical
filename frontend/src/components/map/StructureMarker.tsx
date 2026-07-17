"use client";

import { Marker, Popup } from "react-leaflet";
import type { MapStructure } from "./MedicalMap";
import { useStructureSelectionStore } from "@/features/structure-selection/store/structure-selection-store";
import L from "leaflet";

type StructureMarkerProps = {
  structure: MapStructure;
};

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

export default function StructureMarker({
  structure,
}: StructureMarkerProps) {
  const setSelectedStructure = useStructureSelectionStore((state) => state.setSelectedStructure);
  
  const icon = structure.type === "HOPITAL" ? hopitalIcon : pharmacieIcon;

  return (
    <Marker
      position={[
        structure.latitude,
        structure.longitude,
      ]}
      icon={icon}
      eventHandlers={{
        click: () => {
          setSelectedStructure(structure);
        },
      }}
    >
      <Popup>
        <div className="space-y-2">
          <h3 className="font-semibold">
            {structure.nom}
          </h3>
          <p className="text-sm">
            Type : {structure.type}
          </p>
          <p className="text-sm">
            {structure.adresse}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}