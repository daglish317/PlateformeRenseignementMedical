"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Banknote,
  History,
  Receipt,
  RotateCcw,
  Search,
  Undo2,
  XCircle,
} from "lucide-react";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { formatMontant, Vente } from "@/features/vente/types/vente";
import {
  useHistorique,
  usePaiementsRealises,
  useRetours,
  useVentesAttente,
} from "../hooks/useCaisse";
import { EncaissementDialog } from "../components/EncaissementDialog";
import { FactureDialog } from "../components/FactureDialog";
import { AnnulationCaisseDialog } from "../components/AnnulationCaisseDialog";
import { RetourCaisseDialog } from "../components/RetourCaisseDialog";
import type { OperationCaisse, RetourCaisse } from "../types";

const FILTRES_STATUT = [
  { value: "toutes", label: "Toutes" },
  { value: "attente", label: "En attente" },
  { value: "cours", label: "En cours" },
  { value: "expirees", label: "Expirées" },
] as const;

const ORDRES_TAB = [
  { value: "attente", label: "Ventes en attente", icon: Receipt },
  { value: "paiements", label: "Paiements réalisés", icon: Banknote },
  { value: "retours", label: "Retours en caisse", icon: Undo2 },
  { value: "historique", label: "Historique", icon: History },
] as const;

type TabActif = (typeof ORDRES_TAB)[number]["value"];

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function formaterDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR");
}

interface CaissierHomePageProps {
  readonly?: boolean;
  structureId?: string;
  showHeader?: boolean;
}

export function CaissierHomePage({
  readonly = false,
  structureId,
  showHeader = true,
}: CaissierHomePageProps) {
  const [tab, setTab] = useState<TabActif>("attente");
  const [statut, setStatut] = useState<string>("toutes");
  const [rechercheAttente, setRechercheAttente] = useState("");
  const [recherchePaiements, setRecherchePaiements] = useState("");

  const rechercheAttenteDebounce = useDebouncedValue(rechercheAttente);
  const recherchePaiementsDebounce = useDebouncedValue(recherchePaiements);

  const { data, isLoading, isError, refetch } = useVentesAttente({
    statut,
    recherche: rechercheAttenteDebounce,
    structureId,
  }, !readonly || Boolean(structureId));
  const {
    data: paiements,
    isLoading: paiementsLoading,
    isError: paiementsError,
  } = usePaiementsRealises(
    recherchePaiementsDebounce,
    structureId,
    !readonly || Boolean(structureId)
  );
  const {
    data: retours,
    isLoading: retoursLoading,
    isError: retoursError,
  } = useRetours(structureId, !readonly || Boolean(structureId));
  const {
    data: historique,
    isLoading: historiqueLoading,
    isError: historiqueError,
  } = useHistorique(structureId, !readonly || Boolean(structureId));

  const [encaissement, setEncaissement] = useState<Vente | null>(null);
  const [facture, setFacture] = useState<Vente | null>(null);
  const [annulation, setAnnulation] = useState<Vente | null>(null);
  const [retourOpen, setRetourOpen] = useState(false);

  return (
    <PageContainer className="space-y-6">
      {showHeader && (
      <PageTitle
        title={readonly ? "Supervision caisse" : "Espace caissier"}
        subtitle="Encaisser les ventes préparées par le gestionnaire"
      />
      )}

      {data?.structure && (
        <SectionCard title={data.structure.nom}>
          <p className="text-sm text-muted-foreground">
            {data.structure.adresse || "Adresse non renseignée"}
            {data.structure.telephone ? ` · ${data.structure.telephone}` : ""}
          </p>
        </SectionCard>
      )}

      <div className="flex flex-wrap gap-2">
        {ORDRES_TAB.map((item) => {
          const Icone = item.icon;
          const isActive = tab === item.value;
          return (
            <Button
              key={item.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(item.value)}
            >
              <Icone className="mr-2 size-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab === "attente" && (
        <SectionCard
          title={`Ventes en attente (${data?.results.length ?? 0})`}
          actions={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 pl-8 sm:w-72"
                  placeholder="Numéro, facture, client, téléphone..."
                  value={rechercheAttente}
                  onChange={(e) => setRechercheAttente(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RotateCcw className="mr-2 size-4" />
                Actualiser
              </Button>
            </div>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTRES_STATUT.map((filtre) => (
              <Button
                key={filtre.value}
                variant={statut === filtre.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatut(filtre.value)}
              >
                {filtre.label}
              </Button>
            ))}
          </div>

          {isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement des ventes...</p>
          )}
          {isError && (
            <p className="p-4 text-sm text-destructive">
              Impossible de charger les ventes en attente.
            </p>
          )}
          {!isLoading && !isError && data && data.results.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Receipt className="size-8" />
              <p>Aucune vente ne correspond à cette recherche.</p>
              <p>Les ventes préparées par le gestionnaire apparaîtront ici.</p>
            </div>
          )}
          {!isLoading &&
            !isError &&
            data &&
            data.results.map((vente) => (
              <div
                key={vente.id}
                className="flex flex-col gap-3 border-b py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{vente.numero}</p>
                    <Badge variant="warning">{vente.etat_label}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {vente.nb_articles} article(s) · préparée par{" "}
                    {vente.prepare_par_nom}
                  </p>
                  <p className="text-muted-foreground">
                    Reçue le {formaterDate(vente.cree_le)}
                    {vente.date_expiration
                      ? ` · expiration : ${formaterDate(vente.date_expiration)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!readonly && vente.etat !== "EXPIREE" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setAnnulation(vente)}
                      >
                        <XCircle className="mr-2 size-4" />
                        Annuler
                      </Button>
                      <Button onClick={() => setEncaissement(vente)}>
                        <Banknote className="mr-2 size-4" />
                        Encaisser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </SectionCard>
      )}

      {tab === "paiements" && (
        <SectionCard
          title={`Paiements réalisés (${paiements?.length ?? 0})`}
          actions={
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-8 sm:w-72"
                placeholder="Numéro, facture, client, téléphone..."
                value={recherchePaiements}
                onChange={(e) => setRecherchePaiements(e.target.value)}
              />
            </div>
          }
        >
          {paiementsLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement des paiements...</p>
          )}
          {paiementsError && (
            <p className="p-4 text-sm text-destructive">
              Impossible de charger les paiements réalisés.
            </p>
          )}
          {!paiementsLoading && !paiementsError && paiements?.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Banknote className="size-8" />
              <p>Aucun paiement enregistré.</p>
            </div>
          )}
          {!paiementsLoading &&
            !paiementsError &&
            paiements?.map((vente) => (
              <div
                key={vente.id}
                className="flex flex-col gap-3 border-b py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{vente.numero}</p>
                    <Badge>{vente.etat_label}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Facture {vente.facture?.numero ?? "—"} ·{" "}
                    {vente.nb_articles} article(s) · encaissée le{" "}
                    {formaterDate(vente.validee_le)}
                  </p>
                  <p className="text-muted-foreground">
                    Encaissée par {vente.paiement?.encaisse_par_nom ?? "—"}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatMontant(vente.montant_total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFacture(vente)}>
                    <Receipt className="mr-2 size-4" />
                    Consulter le reçu
                  </Button>
                </div>
              </div>
            ))}
        </SectionCard>
      )}

      {tab === "retours" && (
        <SectionCard
          title={`Retours en caisse (${retours?.length ?? 0})`}
          actions={
            !readonly ? (
            <Button onClick={() => setRetourOpen(true)}>
              <Undo2 className="mr-2 size-4" />
              Nouveau retour
            </Button>
            ) : undefined
          }
        >
          {retoursLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement des retours...</p>
          )}
          {retoursError && (
            <p className="p-4 text-sm text-destructive">
              Impossible de charger les retours en caisse.
            </p>
          )}
          {!retoursLoading && !retoursError && retours?.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Undo2 className="size-8" />
              <p>Aucun retour en caisse enregistré.</p>
            </div>
          )}
          {!retoursLoading &&
            !retoursError &&
            retours?.map((retour: RetourCaisse) => (
              <div
                key={retour.id}
                className="flex flex-col gap-3 border-b py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{retour.numero}</p>
                    <Badge variant="secondary">{retour.motif_label}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Vente {retour.vente_numero} · Facture{" "}
                    {retour.facture_numero ?? "—"} · {retour.nb_articles} article(s)
                  </p>
                  <p className="text-muted-foreground">
                    Par {retour.effectue_par_nom} le {formaterDate(retour.effectue_le)}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatMontant(retour.montant_total)}
                  </p>
                  {retour.commentaire ? (
                    <p className="text-muted-foreground">
                      {retour.commentaire}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
        </SectionCard>
      )}

      {tab === "historique" && (
        <SectionCard title="Journal des opérations (traçabilité)">
          {historiqueLoading && (
            <p className="p-4 text-sm text-muted-foreground">Chargement de l&apos;historique...</p>
          )}
          {historiqueError && (
            <p className="p-4 text-sm text-destructive">
              Impossible de charger l&apos;historique.
            </p>
          )}
          {!historiqueLoading && !historiqueError && historique?.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <History className="size-8" />
              <p>Aucune opération enregistrée.</p>
            </div>
          )}
          {!historiqueLoading && !historiqueError && historique && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2 font-medium">Date / heure</th>
                    <th className="p-2 font-medium">Utilisateur</th>
                    <th className="p-2 font-medium">Rôle</th>
                    <th className="p-2 font-medium">Action</th>
                    <th className="p-2 font-medium">Détail</th>
                    <th className="p-2 font-medium">Résultat</th>
                    <th className="p-2 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((operation: OperationCaisse) => (
                    <tr key={operation.id} className="border-b">
                      <td className="p-2 whitespace-nowrap">
                        {formaterDate(operation.cree_le)}
                      </td>
                      <td className="p-2">{operation.utilisateur_nom}</td>
                      <td className="p-2">{operation.role}</td>
                      <td className="p-2">{operation.action_label}</td>
                      <td className="p-2">{operation.detail}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            operation.resultat === "SUCCES"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {operation.resultat_label}
                        </Badge>
                      </td>
                      <td className="p-2">{operation.adresse_ip ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      <EncaissementDialog
        vente={encaissement}
        open={encaissement !== null}
        onOpenChange={(open) => {
          if (!open) setEncaissement(null);
        }}
        onPayed={(vente) => setFacture(vente)}
      />

      <FactureDialog
        vente={facture}
        open={facture !== null}
        onOpenChange={(open) => {
          if (!open) setFacture(null);
        }}
      />

      <AnnulationCaisseDialog
        vente={annulation}
        open={annulation !== null}
        onOpenChange={(open) => {
          if (!open) setAnnulation(null);
        }}
      />

      <RetourCaisseDialog open={retourOpen} onOpenChange={setRetourOpen} />
    </PageContainer>
  );
}
