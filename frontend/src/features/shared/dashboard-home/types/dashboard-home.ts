export type StructureType = "HOPITAL" | "PHARMACIE";

export interface StructureInfo {
  id: string;
  nom: string;
  type: StructureType;
  photo: string | null;
  adresse: string;
  telephone: string;
  latitude: number | null;
  longitude: number | null;
  statut: "EN_ATTENTE" | "ACTIVE" | "SUSPENDUE" | "REFUSEE";
  date_creation: string;
  date_validation: string | null;
  motif_refus: string | null;
}

export interface DashboardHomeData {
  structure: StructureInfo;
  stats: {
    services_count?: number;
    analyses_count?: number;
    technical_platforms_count?: number;
    care_services_count?: number;
    stock_items_count?: number;
    available_items?: number;
    low_stock_items?: number;
    out_of_stock_items?: number;
  };
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  created_at: string;
}
