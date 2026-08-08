export type StructureMemberRole = "PROPRIETAIRE" | "GESTIONNAIRE" | "CAISSIER";
export type StructureMemberStatus = "INVITE" | "ACTIF" | "SUSPENDU";

export type StructureTeamMember = {
  id: string;
  utilisateur_id: string;
  nom: string;
  email: string;
  role: StructureMemberRole;
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

export type InviteStructureMemberPayload = {
  structure_id: string;
  nom: string;
  email: string;
  role: "GESTIONNAIRE" | "CAISSIER";
};

export type UpdateStructureMemberStatusPayload = {
  memberId: string;
  action: "ACTIVATE" | "DEACTIVATE";
};
