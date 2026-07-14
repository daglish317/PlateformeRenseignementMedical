import {
  Activity,
  Car,
  Flame,
  HeartPulse,
  LucideIcon,
} from "lucide-react";

import { THEME } from "./theme";


export type EmergencyType =
  | "stroke"
  | "accident"
  | "cardiac"
  | "burn";


export type EmergencyItem = {
  id: EmergencyType;
  title: string;
  
  icon: LucideIcon;
  color: {
    background: string;
    border: string;
    icon: string;
    shadow: string;
    ring: string;
  };
};


export const emergencies: EmergencyItem[] = [
  {
    id: "stroke",
    title: "AVC",
    
    icon: Activity,
    color: THEME.emergency.stroke,
  },

  {
    id: "accident",
    title: "Accident",
    
    icon: Car,
    color: THEME.emergency.accident,
  },

  {
    id: "cardiac",
    title: "Cardiaque",
    
    icon: HeartPulse,
    color: THEME.emergency.cardiac,
  },

  {
    id: "burn",
    title: "Brûlure",
   
    icon: Flame,
    color: THEME.emergency.burn,
  },
];