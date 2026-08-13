"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Printer } from "lucide-react";
import { useFacture, useImprimerFacture, useTelechargerRecu } from "../hooks/useCaisse";
import {
  formatMontant,
  MODES_PAIEMENT,
  Vente,
} from "@/features/vente/types/vente";

interface FactureDialogProps {
  vente: Vente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function modeLabel(mode: string): string {
  return MODES_PAIEMENT.find((option) => option.value === mode)?.label ?? mode;
}

export function FactureDialog({ vente, open, onOpenChange }: FactureDialogProps) {
  const { data, isLoading } = useFacture(vente?.id ?? null, open);
  const imprimerMutation = useImprimerFacture(vente?.id ?? null);
  const telechargerMutation = useTelechargerRecu();

  const factureVente = data ?? vente;

  if (!factureVente) return null;

  const handleImprimer = async () => {
    if (!vente?.id) return;
    try {
      await imprimerMutation.mutateAsync();
      telechargerMutation.mutate(vente.id);
    } catch {
      // l'erreur est déjà affichée par le hook d'impression
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture {factureVente.facture?.numero ?? ""}</DialogTitle>
          <DialogDescription>
            {factureVente.structure_nom}
            {factureVente.structure_adresse ? ` · ${factureVente.structure_adresse}` : ""}
            {factureVente.structure_telephone ? ` · ${factureVente.structure_telephone}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement de la facture...</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Vente</span>
              <span className="font-medium text-foreground">{factureVente.numero}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Date</span>
              <span className="font-medium text-foreground">
                {factureVente.validee_le
                  ? new Date(factureVente.validee_le).toLocaleString("fr-FR")
                  : new Date(factureVente.cree_le).toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Bénéficiaire</span>
              <span className="font-medium text-foreground">
                {factureVente.nom_client || "—"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Préparée par</span>
              <span className="font-medium text-foreground">
                {factureVente.prepare_par_nom}
              </span>
            </div>
            {factureVente.paiement && (
              <div className="flex justify-between text-muted-foreground">
                <span>Encaissé par</span>
                <span className="font-medium text-foreground">
                  {factureVente.paiement.encaisse_par_nom} ·{" "}
                  {modeLabel(factureVente.paiement.mode)}
                </span>
              </div>
            )}

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2 font-medium">Désignation</th>
                    <th className="p-2 text-center font-medium">Qté</th>
                    <th className="p-2 text-right font-medium">Prix unitaire</th>
                    <th className="p-2 text-right font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {factureVente.lignes.map((ligne) => (
                    <tr key={ligne.id} className="border-b">
                      <td className="p-2">{ligne.designation}</td>
                      <td className="p-2 text-center">{ligne.quantite}</td>
                      <td className="p-2 text-right">
                        {formatMontant(ligne.prix_unitaire)}
                      </td>
                      <td className="p-2 text-right">{formatMontant(ligne.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMontant(factureVente.montant_total)}</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Impressions enregistrées : {factureVente.total_impressions ?? 0}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={imprimerMutation.isPending || telechargerMutation.isPending}
          >
            Fermer
          </Button>
          <Button
            variant="outline"
            onClick={() => vente?.id && telechargerMutation.mutate(vente.id)}
            disabled={!vente?.id || telechargerMutation.isPending}
          >
            <Download className="mr-2 size-4" />
            {telechargerMutation.isPending ? "Téléchargement..." : "Télécharger le reçu"}
          </Button>
          <Button
            onClick={() => handleImprimer()}
            disabled={imprimerMutation.isPending || telechargerMutation.isPending}
          >
            <Printer className="mr-2 size-4" />
            {imprimerMutation.isPending ? "Impression..." : "Imprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
