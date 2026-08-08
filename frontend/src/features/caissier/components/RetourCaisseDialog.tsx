"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreerRetour, usePaiementsRealises } from "../hooks/useCaisse";
import { formatMontant } from "@/features/vente/types/vente";

interface RetourCaisseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOTIFS_RETOUR = [
  { value: "CLIENT_SANS_ARGENT", label: "Client sans argent" },
  { value: "PRODUIT_RETIRE", label: "Produit retiré" },
  { value: "ERREUR_QUANTITE", label: "Erreur de quantité" },
  { value: "ERREUR_PRIX", label: "Erreur de prix" },
  { value: "RETOUR_ACCEPTE", label: "Retour accepté" },
  { value: "PRODUIT_DEFECTUEUX", label: "Produit défectueux" },
  { value: "AUTRE", label: "Autre" },
] as const;

export function RetourCaisseDialog({ open, onOpenChange }: RetourCaisseDialogProps) {
  const { data: paiements, isLoading } = usePaiementsRealises("");
  const retourMutation = useCreerRetour();

  const [venteId, setVenteId] = useState("");
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const vente = useMemo(
    () => paiements?.find((v) => v.id === venteId) ?? null,
    [paiements, venteId]
  );

  const reset = () => {
    setVenteId("");
    setQuantites({});
    setMotif("");
    setCommentaire("");
  };

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) reset();
  };

  const items = vente
    ? vente.lignes
        .map((ligne) => ({
          ligne,
          quantite: Math.min(quantites[ligne.id] ?? 0, ligne.quantite),
        }))
        .filter((item) => item.quantite > 0)
    : [];

  const canSubmit =
    vente !== null &&
    motif !== "" &&
    items.length > 0 &&
    (motif !== "AUTRE" || (commentaire ?? "").trim() !== "") &&
    !retourMutation.isPending;

  const handleConfirm = () => {
    if (!vente || !canSubmit) return;
    retourMutation.mutate(
      {
        vente_id: vente.id,
        motif,
        commentaire: commentaire.trim(),
        items: items.map((item) => ({
          ligne_id: item.ligne.id,
          quantite: item.quantite,
        })),
      },
      {
        onSuccess: () => handleOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Retour en caisse</DialogTitle>
          <DialogDescription>
            Corriger une vente déjà encaissée. La facture d&apos;origine est
            conservée et les produits retournés sont réintégrés au stock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label htmlFor="vente-retour">Vente encaissée</Label>
            <Select
              id="vente-retour"
              value={venteId}
              onChange={(e) => {
                setVenteId(e.target.value);
                setQuantites({});
              }}
              disabled={isLoading}
            >
              <option value="">Sélectionnez une vente...</option>
              {(paiements ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.numero} · {formatMontant(v.montant_total)} ·{" "}
                  {v.facture?.numero ?? ""}
                </option>
              ))}
            </Select>
          </div>

          {vente && (
            <>
              <div className="space-y-2">
                <Label>Produits à retourner</Label>
                <div className="rounded-md border">
                  {vente.lignes.map((ligne) => (
                    <div
                      key={ligne.id}
                      className="flex items-center justify-between gap-4 border-b px-3 py-2 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{ligne.designation}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMontant(ligne.prix_unitaire)} × {ligne.quantite} vendu(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qte-${ligne.id}`} className="sr-only">
                          Quantité retournée
                        </Label>
                        <Input
                          id={`qte-${ligne.id}`}
                          type="number"
                          min={0}
                          max={ligne.quantite}
                          value={quantites[ligne.id] ?? 0}
                          onChange={(e) => {
                            const valeur = Math.max(0, Number(e.target.value) || 0);
                            setQuantites((prev) => ({
                              ...prev,
                              [ligne.id]: Math.min(valeur, ligne.quantite),
                            }));
                          }}
                          className="h-8 w-24"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motif-retour">Motif du retour (obligatoire)</Label>
                <Select
                  id="motif-retour"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                >
                  <option value="">Choisissez un motif...</option>
                  {MOTIFS_RETOUR.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {motif === "AUTRE" && (
                <div className="space-y-2">
                  <Label htmlFor="commentaire-retour">
                    Commentaire (obligatoire pour « Autre »)
                  </Label>
                  <Textarea
                    id="commentaire-retour"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Précisez le motif du retour..."
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={retourMutation.isPending}
          >
            Retour
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            {retourMutation.isPending ? "Enregistrement..." : "Enregistrer le retour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
