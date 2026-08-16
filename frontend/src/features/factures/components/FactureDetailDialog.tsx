"use client";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatMontant } from "@/features/vente/types/vente";
import { useFactureDetail } from "../hooks/useFactures";

interface FactureDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factureId: string | null;
  numero: string;
  onImprimer: (id: string) => void;
  impressionEnCours: boolean;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FactureDetailDialog({
  open,
  onOpenChange,
  factureId,
  numero,
  onImprimer,
  impressionEnCours,
}: FactureDetailDialogProps) {
  const { data, isLoading } = useFactureDetail(open ? factureId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Facture {numero}</DialogTitle>
          <DialogDescription>
            Document officiel rattaché à la vente. Consultation seule,
            impression possible via le bouton PDF.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de la facture...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{data.structure_nom}</p>
                {data.structure_adresse && (
                  <p className="text-muted-foreground">{data.structure_adresse}</p>
                )}
                {data.structure_telephone && (
                  <p className="text-muted-foreground">
                    {data.structure_telephone}
                  </p>
                )}
              </div>
              <div className="space-y-1 text-right">
                <p>
                  Bénéficiaire :{" "}
                  <span className="font-medium">
                    {data.beneficiaire || "Non renseigné"}
                  </span>
                </p>
                <p>
                  Vente : <span className="font-medium">{data.vente_numero}</span>
                </p>
                <p>
                  Date : <span className="font-medium">{formatDate(data.cree_le)}</span>
                </p>
                <p>
                  Paiement :{" "}
                  <span className="font-medium">
                    {data.paiement_mode ?? "—"}
                  </span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2 font-medium">Produit</th>
                    <th className="p-2 font-medium">Prix unitaire</th>
                    <th className="p-2 font-medium">Quantité</th>
                    <th className="p-2 font-medium text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.lignes ?? []).map((ligne) => (
                    <tr key={ligne.id} className="border-b">
                      <td className="p-2">{ligne.designation}</td>
                      <td className="p-2">{formatMontant(ligne.prix_unitaire)}</td>
                      <td className="p-2">{ligne.quantite}</td>
                      <td className="p-2 text-right">{formatMontant(ligne.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {data.nb_articles} article(s)
              </p>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  Total : {formatMontant(data.montant_total)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onImprimer(data.id)}
                  disabled={impressionEnCours}
                >
                  {impressionEnCours ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Printer className="size-4" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
