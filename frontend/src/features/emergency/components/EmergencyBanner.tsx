"use client";

import { useSearchStore } from "@/store/search-store";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmergencyBanner() {
  const searchMode = useSearchStore((state) => state.searchMode);
  const setSearchMode = useSearchStore((state) => state.setSearchMode);
  const setQuery = useSearchStore((state) => state.setQuery);

  if (searchMode !== "emergency") return null;

  const clearEmergency = () => {
    setSearchMode("normal");
    setQuery("");
  };

  return (
    <div className="flex items-center justify-between bg-destructive/10 px-6 py-3 text-destructive border-y border-destructive/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-semibold">Mode urgence activé</span>
      </div>
      <Button variant="ghost" size="icon" onClick={clearEmergency} className="h-6 w-6 hover:bg-destructive/20 text-destructive">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
