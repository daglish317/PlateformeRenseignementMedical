"use client";

import CurrentLocationButton from "./CurrentLocationButton";


type MapControlsProps = {
  onLocation: (location: {
    latitude: number;
    longitude: number;
  }) => void;
};


export default function MapControls({
  onLocation,
}: MapControlsProps) {

  return (
    <div
      className="
        absolute
        bottom-24
        right-4
        z-[1000]
        flex
        flex-col
        gap-3
        md:bottom-6
        md:right-6
      "
    >
      <CurrentLocationButton
        onLocation={onLocation}
      />
    </div>
  );
}