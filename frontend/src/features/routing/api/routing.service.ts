import axios from "@/lib/axios";
import type { Route, RouteResponse } from "../types/route";

export const getRoute = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<Route> => {
  const { data } = await axios.get<RouteResponse>("/routing/", {
    params: {
      start_lat: startLat,
      start_lng: startLng,
      end_lat: endLat,
      end_lng: endLng,
    },
  });

  return data.route;
};
