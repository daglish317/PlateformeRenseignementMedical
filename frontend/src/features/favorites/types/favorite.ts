export type FavoriteStructure = {
  id: string;
  nom: string;
  type: string;
  photo: string | null;
  adresse: string;
};

export type Favorite = {
  id: string;
  structure: FavoriteStructure;
  dateAjout: string;
};
