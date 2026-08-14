export type ModuleOperationnel =
  | "APPROVISIONNEMENT"
  | "STOCK"
  | "VENTE"
  | "CAISSE"
  | "INVENTAIRE"
  | "ALERTES"
  | "PEREMPTION"
  | "HISTORIQUE"
  | "HORAIRES"
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
