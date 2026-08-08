"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useMedicamentVenteSearch } from "../hooks/useMedicamentVenteSearch";
import { formatMontant, MedicamentAvecStock } from "../types/vente";

interface MedicamentVenteComboboxProps {
  structureId: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (medicament: MedicamentAvecStock) => void;
  placeholder?: string;
}

export function MedicamentVenteCombobox({
  structureId,
  value,
  onChange,
  onSelect,
  placeholder = "Rechercher un médicament...",
}: MedicamentVenteComboboxProps) {
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

  const { data: results, isFetching } = useMedicamentVenteSearch(
    structureId,
    debounced
  );

  const filtered = useMemo(() => {
    if (!debounced.trim()) return [];
    const normalized = debounced.trim().toLowerCase();
    return (results ?? []).filter((med) =>
      med.nom.toLowerCase().includes(normalized)
    );
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

  const handleSelect = (medicament: MedicamentAvecStock) => {
    onChange(medicament.nom);
    setOpen(false);
    onSelect(medicament);
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
      {open && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-background shadow-lg">
          {isFetching && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Recherche en cours...
            </li>
          )}
          {!isFetching && filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Aucun médicament trouvé.
            </li>
          )}
          {filtered.map((medicament) => (
            <li key={medicament.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(medicament)}
              >
                <span className="min-w-0">
                  <span className="block truncate">{medicament.nom}</span>
                  <span className="block text-xs text-muted-foreground">
                    {medicament.forme_label} · {formatMontant(medicament.prix_vente)}
                  </span>
                </span>
                <span
                  className={
                    medicament.stock_disponible > 0
                      ? "text-xs font-medium"
                      : "text-xs font-medium text-destructive"
                  }
                >
                  {medicament.stock_disponible} dispo.
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
