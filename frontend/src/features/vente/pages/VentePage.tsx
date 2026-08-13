"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";
import { VenteLigneForm } from "../components/VenteLigneForm";
import { VenteLignesTable } from "../components/VenteLignesTable";
import { AnnulationVenteDialog } from "../components/AnnulationVenteDialog";
import { useCreateVente } from "../hooks/useCreateVente";
import { useVentePreparation } from "../hooks/useVentePreparation";
import { useAjouterLigne, useModifierLigne, useSupprimerLigne } from "../hooks/useVenteLignes";
import { useAnnulerVente, useEnvoyerVenteCaisse } from "../hooks/useEnvoyerVenteCaisse";
import { formatMontant } from "../types/vente";

export default function VentePage() {
  const { data: structureId, isLoading: structureLoading } = useMyStructureId();
  const structure = structureId ?? "";

  const { data: vente, isLoading: venteLoading } = useVentePreparation(structure);
  const createVenteMutation = useCreateVente(structure);

  const [annulationOpen, setAnnulationOpen] = useState(false);
  const [nomClient, setNomClient] = useState("");

  const ajouterMutation = useAjouterLigne(vente?.id ?? "", structure);
  const modifierMutation = useModifierLigne(vente?.id ?? "", structure);
  const supprimerMutation = useSupprimerLigne(vente?.id ?? "", structure);
  const envoyerMutation = useEnvoyerVenteCaisse(vente?.id ?? "", structure);
  const annulerMutation = useAnnulerVente(vente?.id ?? "", structure);

  useEffect(() => {
    if (structure && vente === null && !venteLoading && !createVenteMutation.isPending) {
      createVenteMutation.mutate();
    }
  }, [structure, vente, venteLoading, createVenteMutation]);

  if (structureLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>;
  }
  if (!structureId) {
    return <p className="p-6 text-destructive">Aucune structure associée.</p>;
  }
  if (venteLoading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>;
  }

  const lignes = vente?.lignes ?? [];
  const busy =
    ajouterMutation.isPending ||
    modifierMutation.isPending ||
    supprimerMutation.isPending ||
    envoyerMutation.isPending ||
    annulerMutation.isPending;

  return (
    <PageContainer className="space-y-6">
      <PageTitle
        title="Vente"
        subtitle="Préparer une vente et l'envoyer à la caisse pour encaissement"
      />

      <SectionCard
        title="Informations de la vente"
        actions={
          vente ? <Badge variant="secondary">{vente.etat_label}</Badge> : undefined
        }
      >
        {vente ? (
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Numéro</p>
              <p className="font-medium">{vente.numero}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date et heure</p>
              <p className="font-medium">
                {new Date(vente.cree_le).toLocaleDateString("fr-FR")} ·{" "}
                {new Date(vente.cree_le).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gestionnaire connecté</p>
              <p className="font-medium">{vente.prepare_par_nom}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Articles</p>
              <p className="font-medium">
                {vente.nb_articles} · {formatMontant(vente.montant_total)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-muted-foreground" htmlFor="nom-client">
                Beneficiaire
              </label>
              <Input
                id="nom-client"
                key={vente?.id ?? "nouvelle-vente"}
                defaultValue={vente?.nom_client ?? ""}
                onChange={(event) => setNomClient(event.target.value)}
                placeholder="Nom du beneficiaire"
                disabled={busy}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {createVenteMutation.isPending
              ? "Création d'une nouvelle vente..."
              : "Préparation de la vente..."}
          </p>
        )}
      </SectionCard>

      {vente && (
        <>
          <SectionCard title="Ajouter un médicament">
            <VenteLigneForm
              structureId={structureId}
              onAdd={(medicament, quantite) =>
                ajouterMutation.mutate({ medicamentId: medicament.id, quantite })
              }
              adding={ajouterMutation.isPending}
            />
          </SectionCard>

          <SectionCard title={`Médicaments de la vente (${lignes.length})`}>
            <VenteLignesTable
              lignes={lignes}
              onEdit={(ligneId, quantite) =>
                modifierMutation.mutate({ ligneId, quantite })
              }
              onDelete={(ligneId) => supprimerMutation.mutate(ligneId)}
              busy={busy}
            />
          </SectionCard>

          <SectionCard>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-baseline gap-3 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-semibold">
                  {formatMontant(vente.montant_total)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAnnulationOpen(true)}
                  disabled={busy}
                >
                  <Trash2 className="mr-2 size-4" />
                  Annuler la vente
                </Button>
                <Button
                  onClick={() => envoyerMutation.mutate(nomClient)}
                  disabled={busy || lignes.length === 0}
                >
                  <Send className="mr-2 size-4" />
                  {envoyerMutation.isPending
                    ? "Envoi en cours..."
                    : "Envoyer à la caisse"}
                </Button>
              </div>
            </div>
          </SectionCard>
        </>
      )}

      <AnnulationVenteDialog
        open={annulationOpen}
        onOpenChange={setAnnulationOpen}
        onConfirm={(motif) => {
          annulerMutation.mutate(motif);
          setAnnulationOpen(false);
        }}
        pending={annulerMutation.isPending}
        venteNumero={vente?.numero ?? ""}
      />
    </PageContainer>
  );
}
