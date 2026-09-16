"use client";

import { useEffect } from "react";
import { Building2, Check, ChevronsUpDown, Pill } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import { useActiveStructureStore } from "@/features/shared/owner-structures/store/active-structure-store";
import { cn } from "@/lib/utils";

export function OwnerStructureSwitcher() {
  const { data, isLoading } = useOwnerStructures();
  const activeStructureId = useActiveStructureStore(
    (state) => state.activeStructureId
  );
  const setActiveStructureId = useActiveStructureStore(
    (state) => state.setActiveStructureId
  );

  const structures = data?.results ?? [];
  const pharmacies = structures.filter(
    (structure) => structure.type === "PHARMACIE"
  );

  useEffect(() => {
    if (!activeStructureId && pharmacies.length > 0) {
      setActiveStructureId(pharmacies[0].id);
    }
  }, [activeStructureId, pharmacies, setActiveStructureId]);

  const activeStructure =
    structures.find((structure) => structure.id === activeStructureId) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 w-full justify-start gap-2 px-3"
            disabled={isLoading || pharmacies.length === 0}
          >
            <Pill className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-left text-sm">
              {activeStructure
                ? activeStructure.nom
                : isLoading
                  ? "Chargement des pharmacies..."
                  : "Aucune pharmacie"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Mes pharmacies</span>
              <span className="text-xs font-normal text-muted-foreground">
                Changer de pharmacie active
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {pharmacies.length === 0 ? (
          <DropdownMenuItem disabled>
            <Building2 className="size-4" />
            Aucune pharmacie
          </DropdownMenuItem>
        ) : (
          pharmacies.map((structure) => (
            <DropdownMenuItem
              key={structure.id}
              onClick={() => setActiveStructureId(structure.id)}
              className={cn(
                "justify-between",
                structure.id === activeStructureId && "bg-accent"
              )}
            >
              <span className="min-w-0 truncate">{structure.nom}</span>
              {structure.id === activeStructureId && (
                <Check className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}