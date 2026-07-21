export interface DashboardStats {
  structures_total: number;
  hopitaux: number;
  pharmacies: number;
  structures_en_attente: number;
  gestionnaires: number;
  utilisateurs_publics: number;
  feedbacks_non_lus: number;
  messages_non_lus: number;
}

export interface DashboardStructure {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  photo: string | null;
  adresse: string;
  telephone?: string;
  statut: "EN_ATTENTE" | "ACTIVE" | "REFUSEE";
  date_creation?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DashboardActivity {
  type: string;
  label: string;
  date: string;
}

export interface ChartDataPoint {
  month: string;
  count: number;
}

export interface DashboardCharts {
  inscriptions_par_mois: ChartDataPoint[];
  validations: ChartDataPoint[];
  recherches: ChartDataPoint[];
  repartition_types: {
    hopital: number;
    pharmacie: number;
  };
}

export interface DashboardMapStructure {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  photo: string | null;
  adresse: string;
  telephone?: string;
  latitude: number;
  longitude: number;
  statut: string;
}

export interface DashboardData {
  stats: DashboardStats;
  pending_structures: DashboardStructure[];
  recent_activity: DashboardActivity[];
  charts: DashboardCharts;
  map_structures: DashboardMapStructure[];
}
