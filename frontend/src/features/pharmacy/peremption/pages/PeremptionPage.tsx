"use client";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { usePeremption } from "../hooks/usePeremption";

export default function PeremptionPage() {
  const { data: structureId, isLoading: structureLoading } = useMyStructureId();
  const { data: produits, isLoading, error } = usePeremption(structureId ?? "");

  if (structureLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>;
  }

  if (!structureId) {
    return <p className="p-6 text-destructive">Aucune structure associee.</p>;
  }

  return (
    <PageContainer>
      <PageTitle
        title="Peremption"
        subtitle="Consultation des produits proches de la peremption"
      />

      <SectionCard title="Produits concernes">
        {isLoading && <p className="p-4 text-muted-foreground">Chargement...</p>}
        {error && <p className="p-4 text-destructive">Erreur de chargement</p>}
        {!isLoading && !error && (
          <>
            {!produits || produits.length === 0 ? (
              <p className="p-4 text-muted-foreground">
                Aucun produit proche de la peremption.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Produit</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Quantite</th>
                      <th className="p-3 font-medium">Date peremption</th>
                      <th className="p-3 font-medium">Temps restant</th>
                      <th className="p-3 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produits.map((produit) => (
                      <tr key={produit.id} className="border-b">
                        <td className="p-3 font-medium">{produit.nom}</td>
                        <td className="p-3">{produit.type}</td>
                        <td className="p-3">{produit.quantite_actuelle}</td>
                        <td className="p-3">{produit.date_peremption}</td>
                        <td className="p-3">{produit.temps_restant}</td>
                        <td className="p-3">
                          {produit.statut === "EXPIRE" ? "Expire" : "Proche"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </PageContainer>
  );
}
