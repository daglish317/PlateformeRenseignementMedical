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
    <section className="px-4 pb-3 pt-1">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10">
          <Activity className="h-3.5 w-3.5 text-red-500" />
        </div>
        <h3 className="text-xs font-semibold tracking-wide text-foreground">
          Urgences médicales
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
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
