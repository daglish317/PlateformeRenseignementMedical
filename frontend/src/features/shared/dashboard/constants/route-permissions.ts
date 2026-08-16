import type { DashboardType } from "../types";
import type { ActionPermission, ModuleOperationnel } from "../types/permissions";

export interface DashboardRouteRequirement {
  module?: ModuleOperationnel;
  action?: ActionPermission;
  blocked?: boolean;
}

type RouteRequirementMap = Record<string, DashboardRouteRequirement>;

const PHARMACY_ROUTE_REQUIREMENTS: RouteRequirementMap = {
  "/pharmacy/stock": { module: "STOCK", action: "CONSULTER" },
  "/pharmacy/medications": { module: "STOCK", action: "CONSULTER" },
  "/pharmacy/supply": { module: "APPROVISIONNEMENT", action: "CONSULTER" },
  "/pharmacy/sale": { module: "VENTE", action: "CONSULTER" },
  "/pharmacy/caisse": { module: "CAISSE", action: "CONSULTER" },
  "/pharmacy/factures": { module: "FACTURE", action: "CONSULTER" },
  "/pharmacy/inventory": { module: "INVENTAIRE", action: "CONSULTER" },
  "/pharmacy/peremption": { module: "PEREMPTION", action: "CONSULTER" },
  "/pharmacy/history": { module: "HISTORIQUE", action: "CONSULTER" },
  "/pharmacy/alertes": { module: "ALERTES", action: "CONSULTER" },
  "/pharmacy/schedules": { module: "HORAIRES", action: "CONSULTER" },
  "/pharmacy/statistics": { module: "STATISTIQUES", action: "CONSULTER" },
  "/pharmacy/notifications": { module: "NOTIFICATIONS", action: "CONSULTER" },
  // Profil et Paramètres ne nécessitent pas de permissions (toujours accessibles)
  // Messagerie bloquée pour les membres d'équipe (exclusivement propriétaire)
  "/pharmacy/chat": { blocked: true },
};

const HOSPITAL_ROUTE_REQUIREMENTS: RouteRequirementMap = {
  "/hospital/profile": { module: "PROFIL", action: "CONSULTER" },
  "/hospital/stock": { module: "STOCK", action: "CONSULTER" },
  "/hospital/schedules": { module: "HORAIRES", action: "CONSULTER" },
  "/hospital/notifications": { module: "NOTIFICATIONS", action: "CONSULTER" },
  "/hospital/settings": { module: "PARAMETRES", action: "CONSULTER" },
  "/hospital/chat": {},
};

const ROUTE_REQUIREMENTS: Record<DashboardType, RouteRequirementMap> = {
  HOPITAL: HOSPITAL_ROUTE_REQUIREMENTS,
  PHARMACIE: PHARMACY_ROUTE_REQUIREMENTS,
  OWNER: {},
};

export function getDashboardRouteRequirement(
  type: DashboardType,
  pathname: string
): DashboardRouteRequirement | null {
  const requirements = ROUTE_REQUIREMENTS[type];

  const match = Object.entries(requirements).find(([href]) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  if (!match) {
    return null;
  }

  return match[1];
}
