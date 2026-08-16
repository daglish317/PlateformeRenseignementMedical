import type {
  ActionPermission,
  ModuleOperationnel,
  PermissionRegistryResponse,
} from "@/features/shared/dashboard/types/permissions";

export type StructureMemberRole = "PROPRIETAIRE" | string; // PROPRIETAIRE is system role, others are free text
export type StructureMemberStatus = "INVITE" | "ACTIF" | "SUSPENDU";

export type TeamPermissionMap = Partial<Record<ModuleOperationnel, ActionPermission[]>>;

export type StructureTeamMember = {
  id: string;
  utilisateur_id: string;
  nom: string;
  email: string;
  role: string | null; // Free text role or null
  statut: StructureMemberStatus;
  is_active: boolean;
  date_invitation: string;
  date_activation: string | null;
};

export type StructureTeamResponse = {
  structure: {
    id: string;
    nom: string;
    type: string;
    statut: string;
  };
  results: StructureTeamMember[];
};

export type InviteStructureMemberResponse = {
  message: string;
  data: StructureTeamMember;
};

export type TeamPermissionsResponse = {
  member: StructureTeamMember;
  structure_id: string;
  permissions: TeamPermissionMap;
  registry: PermissionRegistryResponse["modules"];
};

export type InviteStructureMemberPayload = {
  structure_id: string;
  nom: string;
  email: string;
  role?: string | null; // Optional free text role
};

export type UpdateStructureMemberStatusPayload = {
  memberId: string;
  action: "ACTIVATE" | "DEACTIVATE";
};

export type UpdateTeamPermissionsPayload = {
  permissions: TeamPermissionMap;
};
