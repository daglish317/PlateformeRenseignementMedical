"use client";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import {
  FORME_PHARMACEUTIQUE_OPTIONS,
  LigneInput,
} from "../types/approvisionnement";

interface LignesTableProps {
  lignes: LigneInput[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function LignesTable({ lignes, onEdit, onDelete }: LignesTableProps) {
  if (lignes.length === 0) {
    return <p className="text-muted-foreground p-4">Aucun médicament ajouté.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Médicament</th>
            <th className="p-3 font-medium">Forme</th>
            <th className="p-3 font-medium">Quantité</th>
            <th className="p-3 font-medium">Prix achat</th>
            <th className="p-3 font-medium">Prix vente</th>
            <th className="p-3 font-medium">Péremption</th>
            <th className="p-3 font-medium">TVA</th>
            <th className="p-3 font-medium">Réserve</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, index) => (
            <tr key={`${ligne.nom}-${index}`} className="border-b">
              <td className="p-3 font-medium">{ligne.nom}</td>
              <td className="p-3">
                {FORME_LABELS[ligne.forme_pharmaceutique] ?? ligne.forme_pharmaceutique}
              </td>              <td className="p-3">{ligne.quantite}</td>
              <td className="p-3">{ligne.prix_achat.toFixed(2)} FCFA</td>
              <td className="p-3">
                {ligne.prix_vente != null ? `${ligne.prix_vente.toFixed(2)} FCFA` : "—"}
              </td>
              <td className="p-3">{ligne.date_peremption}</td>
              <td className="p-3">{ligne.tva ? "Oui" : "Non"}</td>
              <td className="p-3">{ligne.en_reserve ? "Oui" : "Non"}</td>
              <td className="p-3 text-right space-x-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(index)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FORME_LABELS: Record<string, string> = Object.fromEntries(
  FORME_PHARMACEUTIQUE_OPTIONS.map((option) => [option.value, option.label])
);
