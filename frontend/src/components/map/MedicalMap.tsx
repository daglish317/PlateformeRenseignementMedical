"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { UserLocation } from "@/services/map/geolocalisation";

import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";

import MapControls from "./MapControls";


const MapView = dynamic(
  () => import("./MapView"),
  {
    ssr: false,

    loading: () => (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-muted/20
        "
      >
        <div
          className="
            h-12
            w-12
            animate-spin
            rounded-full
            border-4
            border-primary/20
            border-t-primary
          "
        />
      </div>
    ),
  }
);


export default function MedicalMap() {

  const [location, setLocation] =
    useState<UserLocation | null>(null);


  const {
    locateUser,
  } = useCurrentLocation();



  useEffect(() => {

    async function initializeLocation() {

      const position = await locateUser();


      if (position) {
        setLocation(position);
      }

    }


    initializeLocation();

  }, [locateUser]);



  return (
    <div
      className="
        relative
        h-full
        w-full
      "
    >

      <MapView
        location={location}
      />


      <MapControls
        onLocation={setLocation}
      />

    </div>
  );
}