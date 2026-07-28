import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../api/settings.service";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: settingsService.getProfile,
    staleTime: 60_000,
  });
}
