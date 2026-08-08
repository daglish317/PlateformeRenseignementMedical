"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatMontant, LigneVente } from "../types/vente";

interface VenteLignesTableProps {
  lignes: LigneVente[];
  onEdit: (ligneId: string, quantite: number) => void;
  onDelete: (ligneId: string) => void;
  busy: boolean;
}

export function VenteLignesTable({
  lignes,
  onEdit,
  onDelete,
  busy,
}: VenteLignesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantite, setEditingQuantite] = useState("");

  const startEdit = (ligne: LigneVente) => {
    setEditingId(ligne.id);
    setEditingQuantite(String(ligne.quantite));
  };

  const saveEdit = (ligne: LigneVente) => {
    const value = Number(editingQuantite);
    if (!Number.isInteger(value) || value <= 0) {
      toast.error("La quantité doit être un entier positif.");
      return;
    }
    if (value !== ligne.quantite) {
      onEdit(ligne.id, value);
    }
    setEditingId(null);
  };

  if (lignes.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucun médicament ajouté pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Désignation</th>
            <th className="p-3 font-medium">Forme</th>
            <th className="p-3 text-right font-medium">Prix unitaire</th>
            <th className="p-3 text-center font-medium">Quantité</th>
            <th className="p-3 text-right font-medium">Montant</th>
            <th className="p-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => {
            const isEditing = editingId === ligne.id;
            return (
              <tr key={ligne.id} className="border-b">
                <td className="p-3">{ligne.designation}</td>
                <td className="p-3">{ligne.forme_label}</td>
                <td className="p-3 text-right">{formatMontant(ligne.prix_unitaire)}</td>
                <td className="p-3 text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={1}
                      value={editingQuantite}
                      onChange={(e) => setEditingQuantite(e.target.value)}
                      className="mx-auto w-24"
                    />
                  ) : (
                    ligne.quantite
                  )}
                </td>
                <td className="p-3 text-right">{formatMontant(ligne.montant)}</td>
                <td className="p-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setEditingId(null)}
                        disabled={busy}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        onClick={() => saveEdit(ligne)}
                        disabled={busy}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(ligne)}
                        disabled={busy}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(ligne.id)}
                        disabled={busy}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
