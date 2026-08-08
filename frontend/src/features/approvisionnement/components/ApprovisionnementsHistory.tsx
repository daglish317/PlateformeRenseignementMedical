"use client";
import { useApprovisionnements } from "../hooks/useApprovisionnements";

interface ApprovisionnementsHistoryProps {
  structureId: string;
}

export function ApprovisionnementsHistory({
  structureId,
}: ApprovisionnementsHistoryProps) {
  const { data: approvisionnements, isLoading, error } =
    useApprovisionnements(structureId);

  if (isLoading) {
    return <p className="text-muted-foreground p-4">Chargement...</p>;
  }

  if (error) {
    return <p className="text-destructive p-4">Erreur de chargement</p>;
  }

  if (!approvisionnements || approvisionnements.length === 0) {
    return (
      <p className="text-muted-foreground p-4">
        Aucun approvisionnement enregistré.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Date</th>
            <th className="p-3 font-medium">Fournisseur</th>
            <th className="p-3 font-medium">Référence</th>
            <th className="p-3 font-medium">Médicaments</th>
            <th className="p-3 font-medium">Quantité</th>
            <th className="p-3 font-medium">Créé par</th>
          </tr>
        </thead>
        <tbody>
          {approvisionnements.map((appro) => {
            const totalQuantite = appro.lignes.reduce(
              (sum, ligne) => sum + ligne.quantite,
              0
            );
            return (
              <tr key={appro.id} className="border-b">
                <td className="p-3">{appro.date_reception}</td>
                <td className="p-3">{appro.fournisseur || "—"}</td>
                <td className="p-3">{appro.reference_bon || "—"}</td>
                <td className="p-3">{appro.lignes.length}</td>
                <td className="p-3">{totalQuantite}</td>
                <td className="p-3">{appro.cree_par_nom || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
