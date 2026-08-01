export type SelectedStructure = {
  id: string;
  nom: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  adresse: string;
  photo?: string | null;
  telephone?: string;
};
