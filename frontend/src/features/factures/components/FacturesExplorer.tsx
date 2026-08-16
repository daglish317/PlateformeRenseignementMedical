"use client";
import { useEffect, useState } from "react";
import { FilePlus2, Search } from "lucide-react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFactures, useTelechargerFacturePdf } from "../hooks/useFactures";
import type { Facture, FactureFiltres } from "../types/facture";
import { FactureListTable } from "./FactureListTable";
import { FactureDetailDialog } from "./FactureDetailDialog";
import { GenererFactureDialog } from "./GenererFactureDialog";

interface FacturesExplorerProps {
  structureId: string;
  structureNom?: string;
}

export function FacturesExplorer({
  structureId,
  structureNom,
}: FacturesExplorerProps) {
  const [recherche, setRecherche] = useState("");
  const [beneficiaire, setBeneficiaire] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [filtres, setFiltres] = useState<FactureFiltres>({});

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltres({
        recherche: recherche || undefined,
        beneficiaire: beneficiaire || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [recherche, beneficiaire, dateDebut, dateFin]);

  const { data: factures, isLoading, error } = useFactures(structureId, filtres);
  const telechargerPdf = useTelechargerFacturePdf();

  const [pdfEnCours, setPdfEnCours] = useState<string | null>(null);
  const [detail, setDetail] = useState<Facture | null>(null);
  const [genererOuvert, setGenererOuvert] = useState(false);

  const handleImprimer = (facture: Facture) => {
    setPdfEnCours(facture.id);
    telechargerPdf.mutate(facture.id, {
      onSettled: () => setPdfEnCours(null),
    });
  };

  const handleNouvelleFacture = (factureId: string) => {
    const facture = factures?.find((f) => f.id === factureId);
    setDetail(facture ?? null);
  };

  return (
    <PageContainer>
      <PageTitle
        title="Factures"
        subtitle="Factures des ventes finalisées — consultation, recherche et impression PDF"
        actions={
          <Button type="button" onClick={() => setGenererOuvert(true)}>
            <FilePlus2 className="size-4" />
            Générer une facture
          </Button>
        }
      />

      <SectionCard title="Filtres">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filtre-recherche">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="filtre-recherche"
                className="pl-9"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="N° facture, vente, bénéficiaire..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtre-beneficiaire">Bénéficiaire</Label>
            <Input
              id="filtre-beneficiaire"
              value={beneficiaire}
              onChange={(e) => setBeneficiaire(e.target.value)}
              placeholder="Nom du bénéficiaire..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtre-date-debut">Du</Label>
            <Input
              id="filtre-date-debut"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtre-date-fin">Au</Label>
            <Input
              id="filtre-date-fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={structureNom ? `Factures — ${structureNom}` : "Factures"}
      >
        {isLoading && (
          <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
        )}
        {error && (
          <p className="p-4 text-sm text-destructive">
            Erreur de chargement des factures.
          </p>
        )}
        {factures && (
          <FactureListTable
            factures={factures}
            onConsulter={setDetail}
            onImprimer={handleImprimer}
            pdfEnCours={pdfEnCours}
          />
        )}
      </SectionCard>

      <FactureDetailDialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetail(null)}
        factureId={detail?.id ?? null}
        numero={detail?.numero ?? ""}
        onImprimer={(id) => {
          setPdfEnCours(id);
          telechargerPdf.mutate(id, {
            onSettled: () => setPdfEnCours(null),
          });
        }}
        impressionEnCours={pdfEnCours !== null}
      />

      <GenererFactureDialog
        key={genererOuvert ? "ouvert" : "ferme"}
        open={genererOuvert}
        onOpenChange={setGenererOuvert}
        structureId={structureId}
        onGenerated={handleNouvelleFacture}
      />
    </PageContainer>
  );
}
