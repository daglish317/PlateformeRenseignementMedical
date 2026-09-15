"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

import { useMedicamentSearch } from "../hooks/useMedicamentSearch";
import type { Medicament } from "../types/approvisionnement";

interface MedicamentComboboxProps {
  structureId: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (medicament: Medicament) => void;
  placeholder?: string;
}

export function MedicamentCombobox({
  structureId,
  value,
  onChange,
  onSelect,
  placeholder = "Rechercher un medicament...",
}: MedicamentComboboxProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: results, isFetching } = useMedicamentSearch(structureId, debounced);

  const filtered = useMemo(() => {
    if (!debounced.trim()) return [];

    const normalized = debounced.trim().toLowerCase();
    const matches = (results ?? []).filter((medicament) =>
      medicament.nom.toLowerCase().includes(normalized)
    );

    const alreadyListed = matches.some(
      (medicament) => medicament.nom.toLowerCase() === normalized
    );

    if (!alreadyListed) {
      matches.unshift({
        id: "",
        nom: debounced.trim(),
        forme_pharmaceutique: "AUTRE",
        forme_label: "Autre",
        prix_vente: null,
        prix_achat_actuel: null,
        tva: false,
        en_reserve: false,
        stock_avant: 0,
        stock_physique: 0,
        stock_disponible: 0,
        date_creation: "",
      });
    }

    return matches.slice(0, 8);
  }, [results, debounced]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (medicament: Medicament) => {
    setSearchQuery(medicament.nom);
    onChange(medicament.nom);
    setOpen(false);
    if (medicament.id) {
      onSelect(medicament);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-background shadow-lg">
          {isFetching && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Recherche en cours...
            </li>
          )}
          {filtered.map((medicament) => (
            <li key={medicament.id || `new-${medicament.nom}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(medicament)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{medicament.nom}</span>
                  {medicament.id ? (
                    <span className="text-xs text-muted-foreground">
                      {medicament.forme_label} - Stock actuel {medicament.stock_physique}
                    </span>
                  ) : (
                    <span className="text-xs text-primary">Nouveau medicament</span>
                  )}
                </span>
                {medicament.id && medicament.prix_achat_actuel != null ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Achat {medicament.prix_achat_actuel.toFixed(2)}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
