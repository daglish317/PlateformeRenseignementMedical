"use client";
import { useQuery } from "@tanstack/react-query";
import { getServices, getCatalogues } from "../api/services.service";

export function useServices(structureId: string) {
  const services = useQuery({
    queryKey: ["services", structureId],
    queryFn: () => getServices(structureId),
    enabled: !!structureId,
  });

  const catalogues = useQuery({
    queryKey: ["catalogues", "service"],
    queryFn: () => getCatalogues("service"),
  });

  return { services, catalogues };
}
