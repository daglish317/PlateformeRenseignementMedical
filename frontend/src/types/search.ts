export type Structure = {
  id: string;
  nom: string;
  type: string;
  photo: string | null;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
  
};


export type Catalogue = {
  id: string;
  nom: string;
  type: string;
};

export type Suggestion = {
  id: string;

  nom: string;

  type: string;
};

export type SearchResult = {
  structure: Structure;
  score: number;
  distance_km: number | null;
  walking_time: number | null;
  driving_time: number | null;
  services_matches: string[];
};


export type SearchResponse = {
  query: string;
  catalogue: Catalogue | null;

  results: SearchResult[];

  suggestions: Suggestion[];

  total: number;

  page: number;

  page_size: number;

  message?: string;
};