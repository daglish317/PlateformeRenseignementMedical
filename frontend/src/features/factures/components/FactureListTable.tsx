"use client";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import { formatMontant } from "@/features/vente/types/vente";
import type { Facture } from "../types/facture";

interface FactureListTableProps {
  factures: Facture[];
  onConsulter: (facture: Facture) => void;
  onImprimer: (facture: Facture) => void;
  pdfEnCours?: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function FactureListTable({
  factures,
  onConsulter,
  onImprimer,
  pdfEnCours,
}: FactureListTableProps) {
  if (factures.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucune facture trouvée pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">N° facture</th>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Vente</th>
            <th className="p-3 font-medium">Bénéficiaire</th>
            <th className="p-3 font-medium">Articles</th>
            <th className="p-3 font-medium text-right">Montant</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((facture) => (
            <tr key={facture.id} className="border-b">
              <td className="p-3 font-medium">{facture.numero}</td>
              <td className="p-3">{formatDate(facture.cree_le)}</td>
              <td className="p-3">{facture.vente_numero}</td>
              <td className="p-3">{facture.beneficiaire || "—"}</td>
              <td className="p-3">{facture.nb_articles}</td>
              <td className="p-3 text-right">
                {formatMontant(facture.montant_total)}
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConsulter(facture)}
                    title="Consulter la facture"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onImprimer(facture)}
                    disabled={pdfEnCours === facture.id}
                    title="Imprimer / télécharger le PDF"
                  >
                    {pdfEnCours === facture.id ? (
                      <Download className="h-4 w-4 animate-pulse" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
