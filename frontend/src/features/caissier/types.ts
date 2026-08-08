import type { Vente } from "@/features/vente/types/vente";

export interface RetourCaisseLigne {
  id: string;
  medicament: string;
  designation: string;
  prix_unitaire: number;
  quantite: number;
  montant: number;
}

export interface RetourCaisse {
  id: string;
  structure: string;
  vente: string;
  vente_numero: string;
  facture_numero: string | null;
  numero: string;
  motif: string;
  motif_label: string;
  commentaire: string;
  effectue_par: string;
  effectue_par_nom: string;
  effectue_le: string;
  montant_total: number;
  nb_articles: number;
  lignes: RetourCaisseLigne[];
}

export interface OperationCaisse {
  id: string;
  structure: string;
  vente: string | null;
  vente_numero: string | null;
  utilisateur: string;
  utilisateur_nom: string;
  role: string;
  action: string;
  action_label: string;
  resultat: string;
  resultat_label: string;
  detail: string;
  adresse_ip: string | null;
  cree_le: string;
}

export interface CreerRetourPayload {
  vente_id: string;
  motif: string;
  commentaire?: string;
  items: { ligne_id: string; quantite: number }[];
}

export interface ItemRetour {
  ligne: Vente["lignes"][number];
  quantite: number;
}
