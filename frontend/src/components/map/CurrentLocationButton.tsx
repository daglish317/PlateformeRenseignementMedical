"use client";

import { Loader2, LocateFixed } from "lucide-react";

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
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label="Ma position"
      className="
        group
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-white/60
        bg-white/80
        text-emerald-600
        shadow-md
        shadow-black/10
        backdrop-blur-md
        transition-all
        duration-200
        hover:bg-white
        hover:shadow-lg
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-emerald-500
        disabled:pointer-events-none
        disabled:opacity-60
      "
    >
      {loading
        ? (
          <Loader2
            className="h-5 w-5 animate-spin"
          />
        )
        : (
          <LocateFixed
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
          />
        )}
    </button>
  );
}
