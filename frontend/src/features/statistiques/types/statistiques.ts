export type PeriodeStatistique =
  | ""
  | "aujourdhui"
  | "hier"
  | "semaine"
  | "semaine_precedente"
  | "mois"
  | "mois_precedent"
  | "annee"
  | "personnalisee";

export interface PeriodeInfo {
  libelle: string;
  debut: string | null;
  fin: string | null;
  precedente: PeriodeInfo | null;
}

export interface StatistiquesParams {
  periode: PeriodeStatistique;
  date_debut?: string;
  date_fin?: string;
  produit?: string;
  type?: string;
  vente?: string;
  approvisionnement?: string;
  caisse?: string;
}

export interface PointSerie {
  periode: string;
  valeur: number;
}

export interface VueGenerale {
  periode: PeriodeInfo;
  ventes: {
    nb_validees: number;
    nb_produits_vendus: number;
    ca: number;
    evolution_ventes: number | null;
    evolution_produits: number | null;
  };
  approvisionnements: {
    nombre: number;
    quantite_totale: number;
    evolution: number | null;
  };
  stock: {
    valeur_actuelle: number;
    valeur_achat: number;
    nb_references: number;
    nb_references_disponibles: number;
    nb_ruptures: number;
    nb_sous_seuil: number;
  };
  caisse: {
    nb_paiements_valides: number;
    nb_retours: number;
    nb_annulations: number;
    montant_retours: number;
  };
}

export interface AnalyseVentes {
  periode: PeriodeInfo;
  nb_ventes: number;
  nb_produits_vendus: number;
  evolution_ventes: number | null;
  evolution_produits: number | null;
  series_ventes: PointSerie[];
  series_produits: PointSerie[];
  meilleures_periodes: PointSerie[];
  plus_faibles_periodes: PointSerie[];
}

export interface ProduitVendu {
  medicament_id: string;
  nom: string;
  quantite: number;
  montant: number;
}

export interface ProduitsVendus {
  periode: PeriodeInfo;
  plus_vendus: ProduitVendu[];
  moins_vendus: ProduitVendu[];
}

export interface ProduitFrequent {
  nom: string;
  nb_approvisionnements: number;
  quantite_totale: number;
}

export interface Approvisionnements {
  periode: PeriodeInfo;
  nombre: number;
  quantite_totale: number;
  montant_total: number;
  evolution: number | null;
  series_nombre: PointSerie[];
  series_quantite: PointSerie[];
  periodes_forte_reception: PointSerie[];
  produits_frequents: ProduitFrequent[];
}

export interface StockParType {
  type: string;
  nb_references: number;
  nb_disponibles: number;
  nb_ruptures: number;
  nb_stocks_faibles: number;
}

export interface EvolutionRuptures {
  actuel: number;
  precedent: number;
  variation: number | null;
}

export interface ProduitRupture {
  nom: string;
  nb_ruptures: number;
}

export interface AnalyseStock {
  nb_references: number;
  nb_disponibles: number;
  nb_ruptures: number;
  nb_stocks_faibles: number;
  par_type: StockParType[];
  evolution_ruptures: EvolutionRuptures;
  produits_ruptures: ProduitRupture[];
  valeur: {
    achat: number;
    vente: number;
  };
}

export interface PaiementMode {
  mode: string;
  label: string;
  nombre: number;
  montant: number;
}

export interface AnalyseCaisse {
  periode: PeriodeInfo;
  paiements: {
    nombre: number;
    montant: number;
    evolution: number | null;
  };
  paiements_par_mode: PaiementMode[];
  retours: {
    nombre: number;
    montant: number;
    evolution: number | null;
    frequence_jour: number;
    series: PointSerie[];
  };
  annulations: {
    nombre: number;
    evolution: number | null;
    series: PointSerie[];
  };
}

export interface PaiementFinancier extends PaiementMode {
  pourcentage: number | null;
}

export interface AnalyseFinanciere {
  periode: PeriodeInfo;
  chiffre_affaires: {
    brut: number;
    retours: number;
    net: number;
  };
  nb_ventes_encaissees: number;
  nb_produits_vendus: number;
  panier_moyen: number;
  cout_marchandises: number;
  benefice_brut: number;
  marge_pourcentage: number | null;
  par_mode: PaiementFinancier[];
}

export interface ComparaisonItem {
  actuel: number;
  precedent: number;
  variation: number | null;
}

export interface Comparaison {
  periode_actuelle: PeriodeInfo;
  periode_precedente: PeriodeInfo | null;
  ventes: ComparaisonItem | null;
  approvisionnements: ComparaisonItem | null;
  ruptures: ComparaisonItem | null;
  retours_caisse: ComparaisonItem | null;
}

export interface VenteDetail {
  id: string;
  numero: string;
  validee_le: string;
  heure: string;
  montant_total: number;
  nb_articles: number;
  mode_paiement: string | null;
  mode_label: string;
}

export interface ApprovisionnementDetail {
  id: string;
  numero: string;
  date_reception: string;
  fournisseur: string;
  quantite_totale: number;
  montant_total: number;
}

export interface RetourDetail {
  id: string;
  numero: string;
  effectue_le: string;
  heure: string;
  motif: string;
  montant_total: number;
  nb_articles: number;
}

export interface AnnulationDetail {
  id: string;
  numero: string;
  annulee_le: string;
  heure: string;
  motif_annulation: string;
}

export interface Details {
  periode: PeriodeInfo;
  ventes: {
    total: number;
    items: VenteDetail[];
  };
  approvisionnements: {
    total: number;
    items: ApprovisionnementDetail[];
  };
  retours: {
    total: number;
    items: RetourDetail[];
  };
  annulations: {
    total: number;
    items: AnnulationDetail[];
  };
}

export type OngletStatistiques =
  | "generale"
  | "ventes"
  | "produits"
  | "approvisionnements"
  | "stock"
  | "caisse"
  | "financier"
  | "comparaison"
  | "details";
