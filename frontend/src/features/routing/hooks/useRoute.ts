"use client";

import { useMutation } from "@tanstack/react-query";
import { getRoute } from "../api/routing.service";
import { useRoutingStore } from "../store/routing-store";

type CalculateRouteParams = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

export function useRoute() {
  const setCurrentRoute = useRoutingStore((state) => state.setCurrentRoute);

  const mutation = useMutation({
    mutationFn: (params: CalculateRouteParams) =>
      getRoute(params.startLat, params.startLng, params.endLat, params.endLng),
    onSuccess: (data) => {
      setCurrentRoute(data);
    },
  });

  return {
    calculateRoute: mutation.mutate,
    calculateRouteAsync: mutation.mutateAsync,
    route: mutation.data,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
