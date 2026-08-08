"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDetails } from "../hooks/useStatistiques";
import { StatistiquesParams } from "../types/statistiques";
import { formatMontant, formatNombre } from "../utils/format";
import { StatistiquesSkeleton } from "./StatistiquesSkeleton";
import { SectionErreur } from "./SectionErreur";

interface SectionDetailsProps {
  structureId: string;
  params: StatistiquesParams;
}

function TableauVentes({
  total,
  items,
}: {
  total: number;
  items: {
    numero: string;
    validee_le: string;
    heure: string;
    montant_total: number;
    nb_articles: number;
    mode_label: string;
  }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatNombre(total)} vente{total > 1 ? "s" : ""} — affichage limité
        aux {items.length} plus récentes.
      </p>
      {items.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Aucune vente sur la période.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead className="text-right">Articles</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((vente) => (
              <TableRow key={vente.numero}>
                <TableCell className="font-medium">{vente.numero}</TableCell>
                <TableCell>
                  {vente.validee_le} à {vente.heure}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{vente.mode_label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNombre(vente.nb_articles)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMontant(vente.montant_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function TableauApprovisionnements({
  total,
  items,
}: {
  total: number;
  items: {
    numero: string;
    date_reception: string;
    fournisseur: string;
    quantite_totale: number;
    montant_total: number;
  }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatNombre(total)} approvisionnement
        {total > 1 ? "s" : ""} — affichage limité aux {items.length} plus
        récents.
      </p>
      {items.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Aucun approvisionnement sur la période.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Date de réception</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((appro) => (
              <TableRow key={appro.numero}>
                <TableCell className="font-medium">{appro.numero}</TableCell>
                <TableCell>{appro.date_reception}</TableCell>
                <TableCell>{appro.fournisseur}</TableCell>
                <TableCell className="text-right">
                  {formatNombre(appro.quantite_totale)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMontant(appro.montant_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function TableauRetours({
  total,
  items,
}: {
  total: number;
  items: {
    numero: string;
    effectue_le: string;
    heure: string;
    motif: string;
    montant_total: number;
    nb_articles: number;
  }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatNombre(total)} retour{total > 1 ? "s" : ""} caisse.
      </p>
      {items.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Aucun retour sur la période.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead className="text-right">Articles</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((retour) => (
              <TableRow key={retour.numero}>
                <TableCell className="font-medium">{retour.numero}</TableCell>
                <TableCell>
                  {retour.effectue_le} à {retour.heure}
                </TableCell>
                <TableCell>{retour.motif}</TableCell>
                <TableCell className="text-right">
                  {formatNombre(retour.nb_articles)}
                </TableCell>
                <TableCell className="text-right">
                  {formatMontant(retour.montant_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function TableauAnnulations({
  total,
  items,
}: {
  total: number;
  items: {
    numero: string;
    annulee_le: string;
    heure: string;
    motif_annulation: string;
  }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatNombre(total)} annulation{total > 1 ? "s" : ""}.
      </p>
      {items.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          Aucune annulation sur la période.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Motif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((annulation) => (
              <TableRow key={annulation.numero}>
                <TableCell className="font-medium">
                  {annulation.numero}
                </TableCell>
                <TableCell>
                  {annulation.annulee_le} à {annulation.heure}
                </TableCell>
                <TableCell>{annulation.motif_annulation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function SectionDetails({
  structureId,
  params,
}: SectionDetailsProps) {
  const { data, isLoading, error, refetch } = useDetails(structureId, params);

  if (isLoading) return <StatistiquesSkeleton />;
  if (error || !data) return <SectionErreur onReessayer={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h4 className="text-sm font-semibold">Ventes validées</h4>
        <TableauVentes
          total={data.ventes.total}
          items={data.ventes.items}
        />
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h4 className="text-sm font-semibold">Approvisionnements</h4>
        <TableauApprovisionnements
          total={data.approvisionnements.total}
          items={data.approvisionnements.items}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h4 className="text-sm font-semibold">Retours caisse</h4>
          <TableauRetours total={data.retours.total} items={data.retours.items} />
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h4 className="text-sm font-semibold">Annulations</h4>
          <TableauAnnulations
            total={data.annulations.total}
            items={data.annulations.items}
          />
        </div>
      </div>
    </div>
  );
}
