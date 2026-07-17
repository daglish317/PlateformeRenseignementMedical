import type { Emergency } from "../types/emergency";

export const emergencies: Emergency[] = [
  {
    id: "AVC",
    nom: "AVC",
    description: "Accident Vasculaire Cérébral",
    icon: "Brain",
    searchTerm: "Urgences neurovasculaires",
  },
  {
    id: "ACCIDENT",
    nom: "Accident",
    description: "Traumatisme, accident de la route",
    icon: "AlertTriangle",
    searchTerm: "Traumatologie",
  },
  {
    id: "CARDIAQUE",
    nom: "Cardiaque",
    description: "Douleur thoracique, malaise",
    icon: "HeartPulse",
    searchTerm: "Urgences cardiologiques",
  },
  {
    id: "BRULURE",
    nom: "Brûlure",
    description: "Brûlure grave",
    icon: "Flame",
    searchTerm: "Centre des grands brûlés",
  },
];
