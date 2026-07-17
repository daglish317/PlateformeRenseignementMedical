"use client";

import { useState } from "react";
import { emergencies } from "../constants/emergency-types";
import EmergencyCard from "./EmergencyCard";
import { useSearchStore } from "@/store/search-store";
import { useEmergencySearch } from "../hooks/useEmergencySearch";
import type { Emergency } from "../types/emergency";

export default function EmergencyGrid() {
  const setSearchMode = useSearchStore((state) => state.setSearchMode);
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  
  useEmergencySearch(searchTerm);

  const handleSelect = (emergency: Emergency) => {
    setSearchMode("emergency");
    setSearchTerm(emergency.searchTerm);
  };

  return (
    <div className="grid grid-cols-2 gap-4 px-6 py-4">
      {emergencies.map((emergency) => (
        <EmergencyCard key={emergency.id} emergency={emergency} onClick={handleSelect} />
      ))}
    </div>
  );
}
