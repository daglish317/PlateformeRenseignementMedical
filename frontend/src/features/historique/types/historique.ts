export type TypeEvenementHistorique =
  | "APPROVISIONNEMENT_CREE"
  | "INVENTAIRE_GENERE"
  | "CAISSE_RETOUR";

export interface EvenementResume {
  nombre: number;
  numero: string | null;
  facture: string | null;
}

export interface MedicamentEvent {
  nom: string;
  quantite: number;
}

export interface EvenementHistorique {
  id: string;
  type: TypeEvenementHistorique;
  type_label: string;
  structure_id: string;
  structure_nom: string;
  utilisateur_id: string;
  utilisateur_nom: string;
  role: string;
  cree_le: string;
  date_evenement: string;
  heure_evenement: string;
  resume: EvenementResume;
  donnees: {
    numero?: string;
    numero_retour?: string;
    numero_vente?: string;
    numero_facture?: string;
    fournisseur?: string;
    reference_bon?: string;
    date_reception?: string;
    motif?: string;
    commentaire?: string;
    montant?: string;
    nb_produits?: number;
    nb_disponibles?: number;
    nb_stock_faible?: number;
    nb_ruptures?: number;
    nb_articles?: number;
    medicaments?: MedicamentEvent[];
    [key: string]: unknown;
  };
}

export interface ResumeHistorique {
  evenements_aujourdhui: number;
  approvisionnements: number;
  retours_caisse: number;
  inventaires_generes: number;
}

export type PeriodeHistorique = "" | "aujourdhui" | "semaine" | "mois" | "personnalisee";

export interface HistoriqueFiltres {
  recherche?: string;
  type?: string;
  periode?: PeriodeHistorique;
  date_debut?: string;
  date_fin?: string;
}
