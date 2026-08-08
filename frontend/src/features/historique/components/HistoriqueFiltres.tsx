"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PeriodeHistorique } from "../types/historique";

interface HistoriqueFiltresProps {
  recherche: string;
  onRecherche: (valeur: string) => void;
  periode: PeriodeHistorique;
  onPeriode: (valeur: PeriodeHistorique) => void;
  type: string;
  onType: (valeur: string) => void;
  dateDebut: string;
  onDateDebut: (valeur: string) => void;
  dateFin: string;
  onDateFin: (valeur: string) => void;
}

export function HistoriqueFiltres({
  recherche,
  onRecherche,
  periode,
  onPeriode,
  type,
  onType,
  dateDebut,
  onDateDebut,
  dateFin,
  onDateFin,
}: HistoriqueFiltresProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          placeholder="Rechercher un Ã©vÃ©nement, un mÃ©dicament, un numÃ©ro..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="periode-historique">PÃ©riode</Label>
          <Select
            id="periode-historique"
            value={periode}
            onChange={(e) => onPeriode(e.target.value as PeriodeHistorique)}
          >
            <option value="">Toutes les pÃ©riodes</option>
            <option value="aujourdhui">Aujourd&apos;hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="personnalisee">PÃ©riode personnalisÃ©e</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type-historique">Type d&apos;Ã©vÃ©nement</Label>
          <Select
            id="type-historique"
            value={type}
            onChange={(e) => onType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="APPROVISIONNEMENT_CREE">
              Approvisionnement enregistrÃ©
            </option>
            <option value="INVENTAIRE_GENERE">Inventaire gÃ©nÃ©rÃ©</option>
            <option value="CAISSE_RETOUR">Retour caisse</option>
          </Select>
        </div>

        {periode === "personnalisee" && (
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label htmlFor="date-debut-historique">Du</Label>
              <Input
                id="date-debut-historique"
                type="date"
                value={dateDebut}
                onChange={(e) => onDateDebut(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-fin-historique">Au</Label>
              <Input
                id="date-fin-historique"
                type="date"
                value={dateFin}
                onChange={(e) => onDateFin(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
