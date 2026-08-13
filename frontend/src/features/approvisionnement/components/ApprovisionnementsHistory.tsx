"use client";
import { Fragment, useState } from "react";
import { Download, Eye, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  telechargerApprovisionnementExcel,
  telechargerApprovisionnementPdf,
} from "../api/approvisionnement.service";
import { useApprovisionnements } from "../hooks/useApprovisionnements";
import { Approvisionnement } from "../types/approvisionnement";

interface ApprovisionnementsHistoryProps {
  structureId: string;
}

function formatMontant(value: number | string | null | undefined) {
  const montant = Number(value ?? 0);
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant);
}

function montantLigne(prixAchat: number, quantite: number) {
  return Number(prixAchat) * Number(quantite);
}

function DetailApprovisionnement({ appro }: { appro: Approvisionnement }) {
  const totalCalcule = appro.lignes.reduce(
    (sum, ligne) => sum + montantLigne(ligne.prix_achat, ligne.quantite),
    0
  );

  return (
    <div className="space-y-4 bg-muted/30 p-4">
      <div className="grid gap-3 text-sm md:grid-cols-4">
        <Info label="Numero bon" value={appro.reference_bon || "-"} />
        <Info label="Montant declare" value={formatMontant(appro.montant_total_declare)} />
        <Info label="Montant calcule" value={formatMontant(totalCalcule)} />
        <Info label="Cree par" value={appro.cree_par_nom || "-"} />
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Produit</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Stock avant</th>
              <th className="p-3 font-medium">Ajoutee</th>
              <th className="p-3 font-medium">Stock final</th>
              <th className="p-3 font-medium">Prix achat</th>
              <th className="p-3 font-medium">Prix vente</th>
              <th className="p-3 font-medium">TVA</th>
              <th className="p-3 font-medium">Reserve</th>
              <th className="p-3 font-medium">Peremption</th>
              <th className="p-3 font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            {appro.lignes.map((ligne) => (
              <tr key={ligne.id} className="border-b last:border-b-0">
                <td className="p-3 font-medium">{ligne.medicament_nom}</td>
                <td className="p-3">{ligne.forme_label}</td>
                <td className="p-3">{ligne.stock_avant}</td>
                <td className="p-3">{ligne.quantite}</td>
                <td className="p-3">{ligne.stock_avant + ligne.quantite}</td>
                <td className="p-3">{formatMontant(ligne.prix_achat)}</td>
                <td className="p-3">
                  {ligne.prix_vente == null ? "-" : formatMontant(ligne.prix_vente)}
                </td>
                <td className="p-3">{ligne.tva ? "Oui" : "Non"}</td>
                <td className="p-3">{ligne.en_reserve ? "Oui" : "Non"}</td>
                <td className="p-3">{ligne.date_peremption}</td>
                <td className="p-3">
                  {formatMontant(montantLigne(ligne.prix_achat, ligne.quantite))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function ApprovisionnementsHistory({
  structureId,
}: ApprovisionnementsHistoryProps) {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: approvisionnements, isLoading, error } =
    useApprovisionnements(structureId);

  async function telecharger(
    appro: Approvisionnement,
    format: "pdf" | "excel"
  ) {
    setDownloadingId(`${appro.id}-${format}`);
    try {
      if (format === "pdf") {
        await telechargerApprovisionnementPdf(appro.id);
      } else {
        await telechargerApprovisionnementExcel(appro.id);
      }
    } catch {
      toast.error("Impossible de telecharger le document.");
    } finally {
      setDownloadingId(null);
    }
  }

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Chargement...</p>;
  }

  if (error) {
    return <p className="p-4 text-destructive">Erreur de chargement</p>;
  }

  if (!approvisionnements || approvisionnements.length === 0) {
    return (
      <p className="p-4 text-muted-foreground">
        Aucun approvisionnement enregistre.
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
            <th className="p-3 font-medium">Numero bon</th>
            <th className="p-3 font-medium">Montant declare</th>
            <th className="p-3 font-medium">Produits</th>
            <th className="p-3 font-medium">Quantite</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvisionnements.map((appro) => {
            const totalQuantite = appro.lignes.reduce(
              (sum, ligne) => sum + ligne.quantite,
              0
            );
            const opened = openedId === appro.id;
            return (
              <Fragment key={appro.id}>
                <tr className="border-b">
                  <td className="p-3">{appro.date_reception}</td>
                  <td className="p-3">{appro.fournisseur || "-"}</td>
                  <td className="p-3">{appro.reference_bon || "-"}</td>
                  <td className="p-3">{formatMontant(appro.montant_total_declare)}</td>
                  <td className="p-3">{appro.lignes.length}</td>
                  <td className="p-3">{totalQuantite}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenedId(opened ? null : appro.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => telecharger(appro, "pdf")}
                        disabled={downloadingId === `${appro.id}-pdf`}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => telecharger(appro, "excel")}
                        disabled={downloadingId === `${appro.id}-excel`}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      {downloadingId?.startsWith(appro.id) && (
                        <Download className="mt-2 h-4 w-4 animate-pulse text-muted-foreground" />
                      )}
                    </div>
                  </td>
                </tr>
                {opened && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <DetailApprovisionnement appro={appro} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
