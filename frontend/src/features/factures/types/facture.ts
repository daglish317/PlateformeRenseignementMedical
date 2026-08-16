export interface FactureLigne {
  id: string;
  medicament: string;
  designation: string;
  forme_pharmaceutique: string;
  forme_label: string;
  prix_unitaire: number;
  quantite: number;
  montant: number;
}

export interface Facture {
  id: string;
  numero: string;
  structure: string;
  structure_nom: string;
  vente: string;
  vente_numero: string;
  vente_date: string | null;
  beneficiaire: string;
  montant_total: number;
  nb_articles: number;
  cree_le: string;
  paiement?: string;
  paiement_mode?: string;
  lignes?: FactureLigne[];
  structure_adresse?: string;
  structure_telephone?: string;
}

export interface VenteEligible {
  id: string;
  numero: string;
  etat: string;
  etat_label: string;
  nom_client: string;
  telephone_client: string;
  montant_total: number;
  nb_articles: number;
  cree_le: string;
  validee_le: string | null;
  prepare_par_nom: string;
}

export interface FactureFiltres {
  recherche?: string;
  beneficiaire?: string;
  date_debut?: string;
  date_fin?: string;
}
