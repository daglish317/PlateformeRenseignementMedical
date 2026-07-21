export interface StatisticsCards {
  recherches_total: number;
  utilisateurs_inscrits: number;
  gestionnaires: number;
  structures: number;
  hopitaux: number;
  pharmacies: number;
  feedbacks: number;
  messages: number;
}

export interface TopSearch {
  query: string;
  count: number;
}

export interface PopularStructure {
  id: string;
  nom: string;
  type: "HOPITAL" | "PHARMACIE";
  favoris_count: number;
}

export interface StatisticsData {
  period: string;
  cards: StatisticsCards;
  top_searches: TopSearch[];
  popular_structures: PopularStructure[];
  charts: {
    recherches_par_jour: { month: string; count: number }[];
    inscriptions: { month: string; count: number }[];
    validations: { month: string; count: number }[];
  };
}
