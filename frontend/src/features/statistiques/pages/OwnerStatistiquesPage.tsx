"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, Building2, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import {
  EtatParametres,
  FiltresStatistiques,
} from "@/features/statistiques/components/FiltresStatistiques";
import { ONGLETS_STATISTIQUES } from "@/features/statistiques/constants/periodes";
import { useTelechargerStatistiques } from "@/features/statistiques/hooks/useStatistiques";
import { OngletStatistiques, StatistiquesParams } from "@/features/statistiques/types/statistiques";
import { StatistiquesSkeleton } from "@/features/statistiques/components/StatistiquesSkeleton";

const SectionVueGenerale = dynamic(
  () =>
    import("@/features/statistiques/components/SectionVueGenerale").then(
      (m) => m.SectionVueGenerale
    ),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionVentes = dynamic(
  () =>
    import("@/features/statistiques/components/SectionVentes").then((m) => m.SectionVentes),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionProduits = dynamic(
  () =>
    import("@/features/statistiques/components/SectionProduits").then((m) => m.SectionProduits),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionApprovisionnements = dynamic(
  () =>
    import("@/features/statistiques/components/SectionApprovisionnements").then(
      (m) => m.SectionApprovisionnements
    ),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionStock = dynamic(
  () =>
    import("@/features/statistiques/components/SectionStock").then((m) => m.SectionStock),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionCaisse = dynamic(
  () =>
    import("@/features/statistiques/components/SectionCaisse").then((m) => m.SectionCaisse),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionFinancier = dynamic(
  () =>
    import("@/features/statistiques/components/SectionFinancier").then((m) => m.SectionFinancier),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionComparaison = dynamic(
  () =>
    import("@/features/statistiques/components/SectionComparaison").then(
      (m) => m.SectionComparaison
    ),
  { loading: () => <StatistiquesSkeleton /> }
);
const SectionDetails = dynamic(
  () =>
    import("@/features/statistiques/components/SectionDetails").then((m) => m.SectionDetails),
  { loading: () => <StatistiquesSkeleton /> }
);

function construireParams(etat: EtatParametres): StatistiquesParams {
  const params: StatistiquesParams = { periode: etat.periode };
  if (etat.periode === "personnalisee") {
    if (etat.dateDebut) params.date_debut = etat.dateDebut;
    if (etat.dateFin) params.date_fin = etat.dateFin;
  }
  if (etat.produit.trim()) params.produit = etat.produit.trim();
  if (etat.type) params.type = etat.type;
  if (etat.vente.trim()) params.vente = etat.vente.trim();
  if (etat.approvisionnement.trim()) {
    params.approvisionnement = etat.approvisionnement.trim();
  }
  if (etat.caisse) params.caisse = etat.caisse;
  return params;
}

export default function OwnerStatistiquesPage() {
  const { data, isLoading: structuresEnChargement } = useOwnerStructures();
  const pharmacies = useMemo(
    () => (data?.results ?? []).filter((s) => s.type === "PHARMACIE"),
    [data]
  );

  const [structureId, setStructureId] = useState("");
  const structureSelectionnee = structureId || pharmacies[0]?.id || "";

  const [etat, setEtat] = useState<EtatParametres>({
    periode: "mois",
    dateDebut: "",
    dateFin: "",
    produit: "",
    type: "",
    vente: "",
    approvisionnement: "",
    caisse: "",
  });
  const [onglet, setOnglet] = useState<OngletStatistiques>("generale");

  const params = construireParams(etat);

  const telechargerPdf = useTelechargerStatistiques("pdf", "statistiques.pdf");
  const telechargerExcel = useTelechargerStatistiques("excel", "statistiques.xlsx");

  const handlePdf = () => {
    if (!structureSelectionnee) return;
    telechargerPdf.mutate({ structureId: structureSelectionnee, params });
  };

  const handleExcel = () => {
    if (!structureSelectionnee) return;
    telechargerExcel.mutate({ structureId: structureSelectionnee, params });
  };

  const miseAJour = (patch: Partial<EtatParametres>) =>
    setEtat((actuel) => ({ ...actuel, ...patch }));

  return (
    <PageContainer>
      <PageTitle
        title="Statistiques"
        subtitle="Outil de pilotage du propriétaire : activité, stock, caisse et finances"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePdf}
              disabled={telechargerPdf.isPending || !structureSelectionnee}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcel}
              disabled={telechargerExcel.isPending || !structureSelectionnee}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
          </div>
        }
      />

      <SectionCard title="Pharmacie et paramètres">
        {structuresEnChargement ? (
          <p className="p-2 text-sm text-muted-foreground">Chargement...</p>
        ) : pharmacies.length === 0 ? (
          <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Vous n&apos;avez aucune pharmacie pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="max-w-sm space-y-2">
              <Label htmlFor="structure-statistiques">Structure</Label>
              <Select
                id="structure-statistiques"
                value={structureSelectionnee}
                onChange={(e) => setStructureId(e.target.value)}
              >
                {pharmacies.map((structure) => (
                  <option key={structure.id} value={structure.id}>
                    {structure.nom}
                  </option>
                ))}
              </Select>
            </div>
            <FiltresStatistiques etat={etat} onChange={miseAJour} />
          </div>
        )}
      </SectionCard>

      {structureSelectionnee && (
        <>
          <div className="flex flex-wrap gap-2">
            {ONGLETS_STATISTIQUES.map((ongletItem) => (
              <Button
                key={ongletItem.id}
                variant={onglet === ongletItem.id ? "default" : "outline"}
                size="sm"
                onClick={() => setOnglet(ongletItem.id as OngletStatistiques)}
              >
                {ongletItem.label}
              </Button>
            ))}
          </div>

          <SectionCard>
            <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Période analysée : {params.periode || "Toute la période"}
              {params.date_debut && ` — du ${params.date_debut}`}
              {params.date_fin && ` au ${params.date_fin}`}
              {params.produit && ` — produit : ${params.produit}`}
              {params.type && ` — type : ${params.type}`}
              {params.vente && ` — vente : ${params.vente}`}
              {params.approvisionnement &&
                ` — approvisionnement : ${params.approvisionnement}`}
              {params.caisse && ` — paiement : ${params.caisse}`}
            </p>

            {onglet === "generale" && (
              <SectionVueGenerale structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "ventes" && (
              <SectionVentes structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "produits" && (
              <SectionProduits structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "approvisionnements" && (
              <SectionApprovisionnements
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "stock" && (
              <SectionStock structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "caisse" && (
              <SectionCaisse structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "financier" && (
              <SectionFinancier structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "comparaison" && (
              <SectionComparaison structureId={structureSelectionnee} params={params} />
            )}
            {onglet === "details" && (
              <SectionDetails structureId={structureSelectionnee} params={params} />
            )}
          </SectionCard>
        </>
      )}
    </PageContainer>
  );
}
