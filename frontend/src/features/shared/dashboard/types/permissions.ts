export type ModuleOperationnel =
  | "APPROVISIONNEMENT"
  | "STOCK"
  | "VENTE"
  | "CAISSE"
  | "FACTURE"
  | "SERVICES_MEDICAUX"
  | "PLATEAUX_TECHNIQUES"
  | "PRISES_EN_CHARGE"
  | "INVENTAIRE"
  | "ALERTES"
  | "PEREMPTION"
  | "HISTORIQUE"
  | "HORAIRES"
  | "STATISTIQUES"
  | "NOTIFICATIONS"
  | "PROFIL"
  | "PARAMETRES";

export type ActionPermission =
  | "CONSULTER"
  | "CREER"
  | "MODIFIER"
  | "SUPPRIMER"
  | "EXPORTER"
  | "IMPRIMER"
  | "FILTRER"
  | "RECHERCHER"
  | "ANNULER"
  | "VALIDER_PAIEMENT"
  | "REFUSER_PAIEMENT"
  | "IMPRIMER_RECU"
  | "RETOUR_CAISSE";

export type ModulePermissionsMap = Partial<Record<ModuleOperationnel, ActionPermission[]>>;

export interface StructurePermissionsResponse {
  structure_id: string;
  full_access: boolean;
  modules: ModulePermissionsMap;
}

export interface PermissionRegistryResponse {
  modules: Record<string, string[]>;
}
