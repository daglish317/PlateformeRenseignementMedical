"use client";

import { LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";

import type { UserLocation } from "@/services/map/geolocalisation";


type CurrentLocationButtonProps = {
  onLocation: (location: UserLocation) => void;
};


export default function CurrentLocationButton({
  onLocation,
}: CurrentLocationButtonProps) {

  const {
    loading,
    locateUser,
  } = useCurrentLocation();


  async function handleClick() {

    const position = await locateUser();


    if (position) {
      onLocation(position);
    }

  }


  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      size="icon"
      className="
        h-12
        w-12
        rounded-full
        shadow-lg
      "
      aria-label="Ma position"
    >
      <LocateFixed
        className="
          h-5
          w-5
        "
      />
    </Button>
  );
}