import type { DashboardType } from "../types";
import type { ActionPermission, ModuleOperationnel } from "../types/permissions";

export interface DashboardRouteRequirement {
  module?: ModuleOperationnel;
  action?: ActionPermission;
  blocked?: boolean;
}

type RouteRequirementMap = Record<string, DashboardRouteRequirement>;

const PHARMACY_ROUTE_REQUIREMENTS: RouteRequirementMap = {
  "/pharmacy/profile": { module: "PROFIL", action: "CONSULTER" },
  "/pharmacy/stock": { module: "STOCK", action: "CONSULTER" },
  "/pharmacy/medications": { module: "STOCK", action: "CONSULTER" },
  "/pharmacy/supply": { module: "APPROVISIONNEMENT", action: "CONSULTER" },
  "/pharmacy/sale": { module: "VENTE", action: "CONSULTER" },
  "/pharmacy/inventory": { module: "INVENTAIRE", action: "CONSULTER" },
  "/pharmacy/peremption": { module: "PEREMPTION", action: "CONSULTER" },
  "/pharmacy/history": { module: "HISTORIQUE", action: "CONSULTER" },
  "/pharmacy/alertes": { module: "ALERTES", action: "CONSULTER" },
  "/pharmacy/schedules": { module: "HORAIRES", action: "CONSULTER" },
  "/pharmacy/notifications": { module: "NOTIFICATIONS", action: "CONSULTER" },
  "/pharmacy/settings": { module: "PARAMETRES", action: "CONSULTER" },
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

const CAISSIER_ROUTE_REQUIREMENTS: RouteRequirementMap = {
  "/caissier/profile": { module: "PROFIL", action: "CONSULTER" },
  "/caissier/settings": { module: "PARAMETRES", action: "CONSULTER" },
};

const ROUTE_REQUIREMENTS: Record<DashboardType, RouteRequirementMap> = {
  HOPITAL: HOSPITAL_ROUTE_REQUIREMENTS,
  PHARMACIE: PHARMACY_ROUTE_REQUIREMENTS,
  OWNER: {},
  CAISSIER: CAISSIER_ROUTE_REQUIREMENTS,
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
