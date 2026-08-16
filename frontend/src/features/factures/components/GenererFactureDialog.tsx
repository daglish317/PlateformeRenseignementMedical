"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMontant } from "@/features/vente/types/vente";
import { useGenererFacture, useVentesEligibles } from "../hooks/useFactures";
import type { VenteEligible } from "../types/facture";

interface GenererFactureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structureId: string;
  onGenerated: (factureId: string) => void;
}

export function GenererFactureDialog({
  open,
  onOpenChange,
  structureId,
  onGenerated,
}: GenererFactureDialogProps) {
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [selected, setSelected] = useState<VenteEligible | null>(null);
  const [beneficiaire, setBeneficiaire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const generer = useGenererFacture();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRechercheAppliquee(recherche.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [recherche]);

  const { data: ventes, isLoading } = useVentesEligibles(
    open ? structureId : "",
    rechercheAppliquee
  );

  const handleSelection = (vente: VenteEligible) => {
    setSelected(vente);
    if (!beneficiaire.trim() && vente.nom_client) {
      setBeneficiaire(vente.nom_client.trim());
    }
  };

  const valide = useMemo(
    () => Boolean(selected) && beneficiaire.trim().length > 0,
    [selected, beneficiaire]
  );

  const handleGenerer = () => {
    if (!selected) return;
    setErreur(null);
    generer.mutate(
      { venteId: selected.id, beneficiaire: beneficiaire.trim() },
      {
        onSuccess: (facture) => {
          onGenerated(facture.id);
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          setErreur(
            (error as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? "Impossible de générer la facture."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Générer une facture</DialogTitle>
          <DialogDescription>
            Une facture ne peut être générée qu&apos;à partir d&apos;une vente
            finalisée (payée) qui n&apos;a pas encore de facture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recherche-vente-eligible">
              Rechercher une vente
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recherche-vente-eligible"
                className="pl-9"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Numéro de vente ou nom du client..."
              />
            </div>
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border p-2">
            {isLoading ? (
              <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Chargement des ventes...
              </p>
            ) : ventes && ventes.length > 0 ? (
              ventes.map((vente) => (
                <button
                  key={vente.id}
                  type="button"
                  onClick={() => handleSelection(vente)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    selected?.id === vente.id
                      ? "border-primary bg-primary/10"
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <span>
                    <span className="font-medium">{vente.numero}</span>
                    <span className="ml-2 text-muted-foreground">
                      {vente.nom_client || "Client sans nom"}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatMontant(vente.montant_total)}
                  </span>
                </button>
              ))
            ) : (
              <p className="p-2 text-sm text-muted-foreground">
                Aucune vente finalisée sans facture trouvée.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiaire-facture">
              Bénéficiaire <span className="text-destructive">*</span>
            </Label>
            <Input
              id="beneficiaire-facture"
              value={beneficiaire}
              onChange={(e) => setBeneficiaire(e.target.value)}
              placeholder="Nom du bénéficiaire (obligatoire)"
              disabled={!selected}
            />
            <p className="text-xs text-muted-foreground">
              Repris du nom du client s&apos;il est renseigné sur la vente,
              sinon saisi ici.
            </p>
          </div>

          {erreur && (
            <p className="text-sm text-destructive">{erreur}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generer.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleGenerer}
              disabled={!valide || generer.isPending}
            >
              {generer.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="size-4" />
              )}
              Générer la facture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
