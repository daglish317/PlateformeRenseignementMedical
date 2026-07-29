"use client";
import { useQuery } from "@tanstack/react-query";
import { getCareServices } from "../api/care-services.service";

export function useCareServices(structureId: string) {
  const careServices = useQuery({
    queryKey: ["care-services", structureId],
    queryFn: () => getCareServices(structureId),
    enabled: !!structureId,
  });

  return { careServices };
}
