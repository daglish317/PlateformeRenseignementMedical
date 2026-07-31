"use client";

import { Activity } from "lucide-react";

import EmergencyCard from "./EmergencyCard";

import {
  emergencies,
  EmergencyType,
} from "@/constants/emergency";

type EmergencyGridProps = {
  onSelect?: (type: EmergencyType) => void;
};

export default function EmergencyGrid({
  onSelect,
}: EmergencyGridProps) {
  return (
    <section className="px-5 pb-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
          <Activity className="h-4 w-4 text-red-500" />
        </div>
        <br />
        <br />
      
        <br />
        <h3 className="text-xs font-semibold tracking-wide text-foreground">
          Urgences médicales cliquez ici pour rechercher rapidement
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-2 md:grid-cols-4 grid-cols-2">
        {emergencies.map((emergency) => (
          <EmergencyCard
            key={emergency.id}
            emergency={emergency}
            onClick={onSelect}
          />
        ))}
      </div>
    </section>
  );
}