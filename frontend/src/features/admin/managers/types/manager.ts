export interface ManagerStructure {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  statut: string;
}

export interface ManagerAdmin {
  id: string;
  nom: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  structure: ManagerStructure | null;
}

export interface ManagerFilters {
  search: string;
  statut: string;
  type_structure: string;
  page: number;
  pageSize: number;
  ordering: string;
}
