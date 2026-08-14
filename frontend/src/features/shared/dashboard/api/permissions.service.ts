import api from "@/lib/axios";
import type {
  PermissionRegistryResponse,
  StructurePermissionsResponse,
} from "../types/permissions";

export const dashboardPermissionsService = {
  async getMyPermissions(): Promise<StructurePermissionsResponse> {
    const { data } = await api.get<StructurePermissionsResponse>("/structures/me/permissions/");
    return data;
  },

  async getRegistry(): Promise<PermissionRegistryResponse> {
    const { data } = await api.get<PermissionRegistryResponse>("/structures/permissions/registry/");
    return data;
  },
};
