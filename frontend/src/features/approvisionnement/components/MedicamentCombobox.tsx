"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMedicamentSearch } from "../hooks/useMedicamentSearch";
import { Medicament } from "../types/approvisionnement";

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
  placeholder = "Rechercher un médicament...",
}: MedicamentComboboxProps) {
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const [prevValue, setPrevValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setSearch(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: results, isFetching } = useMedicamentSearch(structureId, debounced);

  const filtered = useMemo(() => {
    if (!debounced.trim()) return [];
    const normalized = debounced.trim().toLowerCase();
    const matches = (results ?? []).filter((med) =>
      med.nom.toLowerCase().includes(normalized)
    );
    const alreadyListed = matches.some(
      (med) => med.nom.toLowerCase() === normalized
    );
    if (!alreadyListed) {
      matches.unshift({
        id: "",
        nom: debounced.trim(),
        forme_pharmaceutique: "AUTRE",
        forme_label: "Autre",
        prix_vente: null,
        tva: false,
        en_reserve: false,
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
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
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
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(medicament)}
              >
                <span>{medicament.nom}</span>
                {medicament.id ? (
                  <span className="text-xs text-muted-foreground">
                    {medicament.forme_label}
                  </span>
                ) : (
                  <span className="text-xs text-primary">
                    Nouveau médicament
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
