"use client";

import EmergencyCard from "./EmergencyCard";

import { emergencies, EmergencyType } from "@/constants/emergency";

type EmergencyGridProps = {
  onSelect?: (type: EmergencyType) => void;
};

export default function EmergencyGrid({
  onSelect,
}: EmergencyGridProps) {
  return (
    // EmergencyGrid.tsx
<section className="px-4 pt-3">
  <div
    className="grid gap-2"
    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))" }}
  >
    {emergencies.map((emergency) => (
      <EmergencyCard key={emergency.id} emergency={emergency} onClick={onSelect} />
    ))}
  </div>
</section>
  );
}