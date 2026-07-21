"use client";
import { useQuery } from "@tanstack/react-query";
import { getCareServices, getCatalogues } from "../api/care-services.service";

export function useCareServices(structureId: string) {
  const careServices = useQuery({
    queryKey: ["care-services", structureId],
    queryFn: () => getCareServices(structureId),
    enabled: !!structureId,
  });

  const catalogues = useQuery({
    queryKey: ["catalogues", "prise-en-charge"],
    queryFn: () => getCatalogues("prise-en-charge"),
  });

  return { careServices, catalogues };
}
