"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useInventaireDetail } from "../hooks/useInventaire";
import { InventaireResume } from "./InventaireResume";
import { InventaireDetailTable } from "./InventaireDetailTable";

interface InventaireDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventaireId: string | null;
  numero: string;
  structureNom: string;
}

export function InventaireDetailDialog({
  open,
  onOpenChange,
  inventaireId,
  numero,
  structureNom,
}: InventaireDetailDialogProps) {
  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRechercheAppliquee(recherche.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [recherche]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setRecherche("");
      setStatut("");
      setRechercheAppliquee("");
    }
    onOpenChange(value);
  };

  const { data, isLoading } = useInventaireDetail(
    open ? inventaireId : null,
    { recherche: rechercheAppliquee, statut }
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Inventaire {numero} — {structureNom}
          </DialogTitle>
          <DialogDescription>
            État du stock au moment de la génération. Document historique
            consultable mais non modifiable.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de l&apos;inventaire...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <p>
                Généré par{" "}
                <span className="font-medium text-foreground">
                  {data.cree_par_nom}
                </span>{" "}
                ({data.role_createur}) le{" "}
                <span className="font-medium text-foreground">
                  {data.date_generation}
                </span>{" "}
                à{" "}
                <span className="font-medium text-foreground">
                  {data.heure_generation}
                </span>
              </p>
            </div>

            <InventaireResume inventaire={data} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recherche-inventaire">
                  Rechercher un produit
                </Label>
                <Input
                  id="recherche-inventaire"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Nom, forme ou statut..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut-inventaire">Statut</Label>
                <Select
                  id="statut-inventaire"
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                >
                  <option value="">Tous les produits</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="STOCK_FAIBLE">Stock faible</option>
                  <option value="RUPTURE">Rupture</option>
                </Select>
              </div>
            </div>

            <InventaireDetailTable
              lignes={data.lignes ?? []}
              isLoading={false}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
