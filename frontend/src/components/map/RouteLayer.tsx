"use client";

import { Polyline } from "react-leaflet";
import { useRoutingStore } from "@/features/routing/store/routing-store";

export default function RouteLayer() {
  const currentRoute = useRoutingStore((state) => state.currentRoute);

  if (!currentRoute || currentRoute.coordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={currentRoute.coordinates}
      pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.8 }}
    />
  );
}
