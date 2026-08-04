export type Structure = {
  id: string;
  nom: string;
  type: string;
  photo?: string | null;
  adresse: string;
  telephone: string;
  latitude: number | null;
  longitude: number | null;
};

export type ServiceItem = {
  id: string;
  nom: string;
  type: string;
};

export type Suggestion = {
  text: string;
  type: string;
};

// Nouveau format du moteur de recherche intelligent
export type UnifiedSearchResult = {
  id: string;
  content: string;
  type: string;
  structure: Structure;
  distance_km: number | null;
  is_available: boolean;
  quantity: number;
  metadata: Record<string, unknown>;
  relevance_score: number;
};

export type UnifiedSearchResponse = {
  results: UnifiedSearchResult[];
  total: number;
  query: string;
  normalized_query: string;
  detected_intent: string | null;
  parsed: {
    term: string;
    location: string | null;
    filters: {
      is_open: boolean;
      urgence: boolean;
      garde: boolean;
    };
  };
  suggestions: Suggestion[];
  user_location: {
    lat: number;
    lon: number;
  } | null;
};

// Format ancien pour compatibilité
export type SearchResult = {
  structure: Structure;
  score: number;
  distance_km: number | null;
  walking_time?: number | null;
  driving_time?: number | null;
  service_matches?: string[];
};

export type SearchResponse = {
  query: string;
  service?: ServiceItem | null;
  results: SearchResult[];
  suggestions: Suggestion[];
  total: number;
  page?: number;
  page_size?: number;
  message?: string;
};
