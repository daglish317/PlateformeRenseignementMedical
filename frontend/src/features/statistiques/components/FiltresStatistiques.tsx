"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PERIODES_RAPIDES_LABELS } from "../constants/periodes";
import { PeriodeStatistique } from "../types/statistiques";

export interface EtatParametres {
  periode: PeriodeStatistique;
  dateDebut: string;
  dateFin: string;
  produit: string;
  type: string;
  vente: string;
  approvisionnement: string;
  caisse: string;
}

interface FiltresStatistiquesProps {
  etat: EtatParametres;
  onChange: (patch: Partial<EtatParametres>) => void;
}

export function FiltresStatistiques({
  etat,
  onChange,
}: FiltresStatistiquesProps) {
  const [produitSaisi, setProduitSaisi] = useState(etat.produit);
  const [venteSaisie, setVenteSaisie] = useState(etat.vente);
  const [approSaisi, setApproSaisi] = useState(etat.approvisionnement);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (produitSaisi.trim() !== etat.produit) {
        onChange({ produit: produitSaisi.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [produitSaisi, onChange, etat.produit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (venteSaisie.trim() !== etat.vente) {
        onChange({ vente: venteSaisie.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [venteSaisie, onChange, etat.vente]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (approSaisi.trim() !== etat.approvisionnement) {
        onChange({ approvisionnement: approSaisi.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [approSaisi, onChange, etat.approvisionnement]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="periode-statistiques">PÃ©riode</Label>
        <Select
          id="periode-statistiques"
          value={etat.periode}
          onChange={(e) =>
            onChange({
              periode: e.target.value as PeriodeStatistique,
            })
          }
        >
          <option value="">Toute la pÃ©riode</option>
          {PERIODES_RAPIDES_LABELS.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </Select>
      </div>

      {etat.periode === "personnalisee" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="date-debut">Du</Label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="date-debut"
                type="date"
                className="pl-8"
                value={etat.dateDebut}
                onChange={(e) => onChange({ dateDebut: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-fin">Au</Label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="date-fin"
                type="date"
                className="pl-8"
                value={etat.dateFin}
                onChange={(e) => onChange({ dateFin: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="filtre-produit">
          <span className="inline-flex items-center gap-1">
            <Search className="h-3.5 w-3.5" />
            Produit
          </span>
        </Label>
        <Input
          id="filtre-produit"
          placeholder="Nom du mÃ©dicament..."
          value={produitSaisi}
          onChange={(e) => setProduitSaisi(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtre-type">Type d&apos;article</Label>
        <Select
          id="filtre-type"
          value={etat.type}
          onChange={(e) => onChange({ type: e.target.value })}
        >
          <option value="">Tous</option>
          <option value="MEDICAMENT">MÃ©dicament</option>
          <option value="EQUIPEMENT">Ã‰quipement</option>
          <option value="CONSOMMABLE">Consommable</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtre-vente">Vente</Label>
        <Input
          id="filtre-vente"
          placeholder="Numero de vente..."
          value={venteSaisie}
          onChange={(e) => setVenteSaisie(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtre-approvisionnement">Approvisionnement</Label>
        <Input
          id="filtre-approvisionnement"
          placeholder="Numero d'approvisionnement..."
          value={approSaisi}
          onChange={(e) => setApproSaisi(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filtre-caisse">
          <span className="inline-flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Mode de paiement
          </span>
        </Label>
        <Select
          id="filtre-caisse"
          value={etat.caisse}
          onChange={(e) => onChange({ caisse: e.target.value })}
        >
          <option value="">Tous</option>
          <option value="ESPECES">EspÃ¨ces</option>
          <option value="CARTE">Carte bancaire</option>
          <option value="MOBILE_MONEY">Mobile money</option>
          <option value="VIREMENT">Virement</option>
          <option value="CHEQUE">ChÃ¨que</option>
        </Select>
      </div>
    </div>
  );
}
