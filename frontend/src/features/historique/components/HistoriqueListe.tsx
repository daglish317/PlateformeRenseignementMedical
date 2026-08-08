"use client";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvenementHistorique } from "../types/historique";
import { HistoriqueTypeBadge } from "./HistoriqueTypeBadge";

interface HistoriqueListeProps {
  evenements: EvenementHistorique[];
  onConsulter: (evenement: EvenementHistorique) => void;
}

function detailResume(evenement: EvenementHistorique): string {
  const donnees = evenement.donnees;
  const numero = donnees.numero ?? donnees.numero_retour;
  if (evenement.type === "CAISSE_RETOUR") {
    return `Retour ${numero ?? "—"} — vente ${donnees.numero_vente ?? "—"} / facture ${donnees.numero_facture ?? "—"} — ${donnees.nb_articles ?? 0} article(s)`;
  }
  if (evenement.type === "INVENTAIRE_GENERE") {
    return `Inventaire ${numero ?? "—"} — ${donnees.nb_produits ?? 0} produit(s)`;
  }
  const ligne = `Approvisionnement ${numero ?? "—"} — ${donnees.nb_produits ?? 0} produit(s)`;
  return donnees.fournisseur ? `${ligne} — ${donnees.fournisseur}` : ligne;
}

export function HistoriqueListe({
  evenements,
  onConsulter,
}: HistoriqueListeProps) {
  if (evenements.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Aucun événement trouvé pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Heure</th>
            <th className="p-3 font-medium">Type d&apos;événement</th>
            <th className="p-3 font-medium">Utilisateur</th>
            <th className="p-3 font-medium">Détail</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {evenements.map((evenement) => (
            <tr key={evenement.id} className="border-b">
              <td className="p-3 whitespace-nowrap">
                {evenement.date_evenement}
              </td>
              <td className="p-3 whitespace-nowrap">
                {evenement.heure_evenement}
              </td>
              <td className="p-3">
                <HistoriqueTypeBadge type={evenement.type} />
              </td>
              <td className="p-3">
                <span className="font-medium">{evenement.utilisateur_nom}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({evenement.role})
                </span>
              </td>
              <td className="p-3 text-muted-foreground">
                {detailResume(evenement)}
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConsulter(evenement)}
                    title="Consulter les détails"
                  >
                    <Eye className="h-4 w-4" />
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
