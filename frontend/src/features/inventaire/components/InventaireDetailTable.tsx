"use client";
import { InventaireLigne } from "../types/inventaire";
import { InventaireStatutBadge } from "./InventaireStatutBadge";

interface InventaireDetailTableProps {
  lignes: InventaireLigne[];
  isLoading?: boolean;
}

export function InventaireDetailTable({
  lignes,
  isLoading,
}: InventaireDetailTableProps) {
  if (isLoading) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
    );
  }

  if (lignes.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucun produit ne correspond à votre recherche.
      </p>
    );
  }

  return (
    <div className="max-h-96 overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background">
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Médicament</th>
            <th className="p-3 font-medium">Forme</th>
            <th className="p-3 font-medium text-right">Physique</th>
            <th className="p-3 font-medium text-right">Réservée</th>
            <th className="p-3 font-medium text-right">Disponible</th>
            <th className="p-3 font-medium text-right">Seuil</th>
            <th className="p-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => (
            <tr key={ligne.id} className="border-b last:border-b-0">
              <td className="p-3 font-medium">{ligne.nom}</td>
              <td className="p-3 text-muted-foreground">
                {ligne.forme_pharmaceutique || "—"}
              </td>
              <td className="p-3 text-right">{ligne.quantite_physique}</td>
              <td className="p-3 text-right">{ligne.quantite_reservee}</td>
              <td className="p-3 text-right font-medium">
                {ligne.quantite_disponible}
              </td>
              <td className="p-3 text-right">{ligne.seuil_alerte}</td>
              <td className="p-3">
                <InventaireStatutBadge statut={ligne.statut} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
