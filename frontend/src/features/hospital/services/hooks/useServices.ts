"use client";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "../api/services.service";

export function useServices(structureId: string) {
  const services = useQuery({
    queryKey: ["services", structureId],
    queryFn: () => getServices(structureId),
    enabled: !!structureId,
  });

  return { services };
}
