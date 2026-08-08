"use client";
import { Search, UserSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FiltreAlerte } from "../types/alerte";

interface AlerteFiltresProps {
  recherche: string;
  onRecherche: (valeur: string) => void;
  filtre: FiltreAlerte;
  onFiltre: (valeur: FiltreAlerte) => void;
  showRechercheUtilisateur: boolean;
  rechercheUtilisateur: string;
  onRechercheUtilisateur: (valeur: string) => void;
}

export function AlerteFiltres({
  recherche,
  onRecherche,
  filtre,
  onFiltre,
  showRechercheUtilisateur,
  rechercheUtilisateur,
  onRechercheUtilisateur,
}: AlerteFiltresProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          placeholder="Rechercher un médicament, un type d'alerte..."
          className="pl-9"
        />
      </div>

      <div
        className={`grid gap-3 ${showRechercheUtilisateur ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <div className="space-y-2">
          <Label htmlFor="filtre-alerte">Filtres</Label>
          <Select
            id="filtre-alerte"
            value={filtre}
            onChange={(e) => onFiltre(e.target.value as FiltreAlerte)}
          >
            <option value="">Toutes</option>
            <option value="critiques">Critiques</option>
            <option value="non_lues">Non lues</option>
            <option value="stock_faible">Stock faible</option>
            <option value="rupture">Rupture</option>
            <option value="supervision">Supervision</option>
          </Select>
        </div>

        {showRechercheUtilisateur && (
          <div className="relative space-y-2">
            <Label htmlFor="recherche-utilisateur-alerte">
              Utilisateur concerné
            </Label>
            <div className="relative">
              <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recherche-utilisateur-alerte"
                value={rechercheUtilisateur}
                onChange={(e) => onRechercheUtilisateur(e.target.value)}
                placeholder="Rechercher par utilisateur..."
                className="pl-9"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
