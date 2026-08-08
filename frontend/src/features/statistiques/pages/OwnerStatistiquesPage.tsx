"use client";
import { useMemo, useState } from "react";
import { BarChart3, Building2, FileSpreadsheet, FileText } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import {
  EtatParametres,
  FiltresStatistiques,
} from "@/features/statistiques/components/FiltresStatistiques";
import { ONGLETS_STATISTIQUES } from "@/features/statistiques/constants/periodes";
import { useTelechargerStatistiques } from "@/features/statistiques/hooks/useStatistiques";
import { OngletStatistiques, StatistiquesParams } from "@/features/statistiques/types/statistiques";
import { SectionVueGenerale } from "@/features/statistiques/components/SectionVueGenerale";
import { SectionVentes } from "@/features/statistiques/components/SectionVentes";
import { SectionProduits } from "@/features/statistiques/components/SectionProduits";
import { SectionApprovisionnements } from "@/features/statistiques/components/SectionApprovisionnements";
import { SectionStock } from "@/features/statistiques/components/SectionStock";
import { SectionCaisse } from "@/features/statistiques/components/SectionCaisse";
import { SectionFinancier } from "@/features/statistiques/components/SectionFinancier";
import { SectionComparaison } from "@/features/statistiques/components/SectionComparaison";
import { SectionDetails } from "@/features/statistiques/components/SectionDetails";

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

  const telechargerPdf = useTelechargerStatistiques(
    "pdf",
    "statistiques.pdf"
  );
  const telechargerExcel = useTelechargerStatistiques(
    "excel",
    "statistiques.xlsx"
  );

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
        subtitle="Outil de pilotage du propriÃ©taire : activitÃ©, stock, caisse et finances"
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

      <SectionCard title="Pharmacie et paramÃ¨tres">
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
            <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              PÃ©riode analysÃ©e : {params.periode || "Toute la pÃ©riode"}
              {params.date_debut && ` â€” du ${params.date_debut}`}
              {params.date_fin && ` au ${params.date_fin}`}
              {params.produit && ` â€” produit : ${params.produit}`}
              {params.type && ` â€” type : ${params.type}`}
              {params.vente && ` — vente : ${params.vente}`}
              {params.approvisionnement &&
                ` — approvisionnement : ${params.approvisionnement}`}
              {params.caisse && ` â€” paiement : ${params.caisse}`}
            </p>

            {onglet === "generale" && (
              <SectionVueGenerale
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "ventes" && (
              <SectionVentes
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "produits" && (
              <SectionProduits
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "approvisionnements" && (
              <SectionApprovisionnements
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "stock" && (
              <SectionStock
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "caisse" && (
              <SectionCaisse
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "financier" && (
              <SectionFinancier
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "comparaison" && (
              <SectionComparaison
                structureId={structureSelectionnee}
                params={params}
              />
            )}
            {onglet === "details" && (
              <SectionDetails
                structureId={structureSelectionnee}
                params={params}
              />
            )}
          </SectionCard>
        </>
      )}
    </PageContainer>
  );
}
