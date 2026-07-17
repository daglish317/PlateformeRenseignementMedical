export type EmergencyType = "AVC" | "ACCIDENT" | "CARDIAQUE" | "BRULURE";

export type Emergency = {
  id: EmergencyType;
  nom: string;
  description: string;
  icon: string;
  searchTerm: string;
};
