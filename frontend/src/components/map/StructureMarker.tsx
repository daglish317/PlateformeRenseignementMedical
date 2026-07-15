"use client";

import { Marker, Popup } from "react-leaflet";

import type { MapStructure } from "./MedicalMap";


type StructureMarkerProps = {
  structure: MapStructure;
};


export default function StructureMarker({
  structure,
}: StructureMarkerProps) {


  return (
    <Marker
      position={[
        structure.latitude,
        structure.longitude,
      ]}
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