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
        bottom-6
        right-6
        z-[1000]
        flex
        flex-col
        gap-3
      "
    >
      <CurrentLocationButton
        onLocation={onLocation}
      />
    </div>
  );
}