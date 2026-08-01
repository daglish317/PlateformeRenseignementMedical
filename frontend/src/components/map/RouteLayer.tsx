"use client";

import { Polyline } from "react-leaflet";
import { useRoutingStore } from "@/features/routing/store/routing-store";

const ROUTE_COLOR = "#16a34a";

export default function RouteLayer() {
  const currentRoute = useRoutingStore((state) => state.currentRoute);

  if (!currentRoute || currentRoute.coordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={currentRoute.coordinates}
      pathOptions={{
        color: ROUTE_COLOR,
        weight: 7,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}
