export type DayOfWeek = "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI" | "DIMANCHE";

export interface Schedule {
  id: string;
  structure: string;
  jour: DayOfWeek;
  heure_ouverture: string;
  heure_fermeture: string;
  est_ferme: boolean;
}

export interface SchedulePayload {
  jour: DayOfWeek;
  heure_ouverture: string;
  heure_fermeture: string;
  est_ferme: boolean;
}
