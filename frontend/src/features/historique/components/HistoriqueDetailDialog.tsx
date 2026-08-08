"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EvenementHistorique } from "../types/historique";
import { HistoriqueTypeBadge } from "./HistoriqueTypeBadge";

interface HistoriqueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evenement: EvenementHistorique | null;
}

function Champ({ label, valeur }: { label: string; valeur: string }) {
  if (!valeur) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{valeur}</p>
    </div>
  );
}

function TableMedicaments({
  medicaments,
}: {
  medicaments: { nom: string; quantite: number }[];
}) {
  if (!medicaments || medicaments.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Médicaments concernés
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="p-2 font-medium">Médicament</th>
              <th className="p-2 font-medium">Quantité</th>
            </tr>
          </thead>
          <tbody>
            {medicaments.map((m, index) => (
              <tr key={`${m.nom}-${index}`} className="border-b last:border-0">
                <td className="p-2">{m.nom}</td>
                <td className="p-2">{m.quantite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HistoriqueDetailDialog({
  open,
  onOpenChange,
  evenement,
}: HistoriqueDetailDialogProps) {
  if (!evenement) return null;
  const d = evenement.donnees;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoriqueTypeBadge type={evenement.type} />
            <span>{evenement.structure_nom}</span>
          </DialogTitle>
          <DialogDescription>
            Détails de l&apos;événement du {evenement.date_evenement} à{" "}
            {evenement.heure_evenement}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-3">
          <Champ label="Utilisateur" valeur={evenement.utilisateur_nom} />
          <Champ label="Rôle" valeur={evenement.role} />
          <Champ
            label="Date et heure"
            valeur={`${evenement.date_evenement} ${evenement.heure_evenement}`}
          />
        </div>

        <div className="space-y-4">
          {evenement.type === "CAISSE_RETOUR" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Champ label="Numéro du retour" valeur={d.numero_retour ?? ""} />
                <Champ label="Numéro de la vente" valeur={d.numero_vente ?? ""} />
                <Champ label="Numéro de la facture" valeur={d.numero_facture ?? ""} />
                <Champ label="Motif" valeur={d.motif ?? ""} />
                <Champ label="Commentaire" valeur={d.commentaire ?? ""} />
                <Champ label="Montant (FCFA)" valeur={d.montant ?? ""} />
                <Champ
                  label="Articles réintégrés"
                  valeur={String(d.nb_articles ?? 0)}
                />
              </div>
              <TableMedicaments medicaments={d.medicaments ?? []} />
            </>
          )}

          {evenement.type === "INVENTAIRE_GENERE" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Champ label="Numéro de l'inventaire" valeur={d.numero ?? ""} />
              <Champ label="Produits" valeur={String(d.nb_produits ?? 0)} />
              <Champ label="Disponibles" valeur={String(d.nb_disponibles ?? 0)} />
              <Champ label="Stock faible" valeur={String(d.nb_stock_faible ?? 0)} />
              <Champ label="Ruptures" valeur={String(d.nb_ruptures ?? 0)} />
            </div>
          )}

          {evenement.type === "APPROVISIONNEMENT_CREE" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Champ
                  label="Numéro de l'approvisionnement"
                  valeur={d.numero ?? ""}
                />
                <Champ label="Date de réception" valeur={d.date_reception ?? ""} />
                <Champ label="Fournisseur" valeur={d.fournisseur ?? ""} />
                <Champ label="Référence du bon" valeur={d.reference_bon ?? ""} />
                <Champ
                  label="Nombre de produits"
                  valeur={String(d.nb_produits ?? 0)}
                />
              </div>
              <TableMedicaments medicaments={d.medicaments ?? []} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
