"use client";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Eye } from "lucide-react";
import { Inventaire } from "../types/inventaire";

interface InventaireListTableProps {
  inventaires: Inventaire[];
  onConsulter: (inventaire: Inventaire) => void;
  onTelechargerPdf: (inventaire: Inventaire) => void;
  onTelechargerExcel: (inventaire: Inventaire) => void;
  pdfEnCours?: string | null;
  excelEnCours?: string | null;
}

export function InventaireListTable({
  inventaires,
  onConsulter,
  onTelechargerPdf,
  onTelechargerExcel,
  pdfEnCours,
  excelEnCours,
}: InventaireListTableProps) {
  if (inventaires.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucun inventaire généré pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">N°</th>
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Heure</th>
            <th className="p-3 font-medium">Généré par</th>
            <th className="p-3 font-medium">Produits</th>
            <th className="p-3 font-medium">Disponibles</th>
            <th className="p-3 font-medium">Stock faible</th>
            <th className="p-3 font-medium">Ruptures</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventaires.map((inventaire) => (
            <tr key={inventaire.id} className="border-b">
              <td className="p-3 font-medium">{inventaire.numero}</td>
              <td className="p-3">{inventaire.date_generation}</td>
              <td className="p-3">{inventaire.heure_generation}</td>
              <td className="p-3">
                <span className="font-medium">{inventaire.cree_par_nom}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({inventaire.role_createur})
                </span>
              </td>
              <td className="p-3">{inventaire.nombre_total_produits}</td>
              <td className="p-3">{inventaire.nombre_disponibles}</td>
              <td className="p-3">{inventaire.nombre_stock_faible}</td>
              <td className="p-3">{inventaire.nombre_ruptures}</td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConsulter(inventaire)}
                    title="Consulter l'inventaire"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTelechargerPdf(inventaire)}
                    disabled={pdfEnCours === inventaire.id}
                    title="Télécharger en PDF"
                  >
                    {pdfEnCours === inventaire.id ? (
                      <Download className="h-4 w-4 animate-pulse" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTelechargerExcel(inventaire)}
                    disabled={excelEnCours === inventaire.id}
                    title="Télécharger en Excel"
                  >
                    {excelEnCours === inventaire.id ? (
                      <Download className="h-4 w-4 animate-pulse" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
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
