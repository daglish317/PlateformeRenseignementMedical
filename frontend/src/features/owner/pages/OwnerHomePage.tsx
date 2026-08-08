"use client";

import { Building2, PlusCircle, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { Link } from "@/i18n/navigation";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";

const STATUT_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  EN_ATTENTE: { label: "En attente", variant: "secondary" },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

export function OwnerHomePage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useOwnerStructures();

  const structures = data?.results ?? [];

  return (
    <PageContainer className="space-y-6">
      <PageTitle
        title="Espace propriétaire"
        subtitle="Gérez vos structures et votre équipe"
      />

      <SectionCard title={`Bienvenue, ${user?.nom ?? "Propriétaire"}`}>
        <p className="text-sm text-muted-foreground">
          Depuis votre espace, vous pouvez créer vos structures (pharmacies, hôpitaux)
          puis assigner des gestionnaires et des caissiers à chacune d&apos;elles.
        </p>
      </SectionCard>

      <SectionCard title="Vos structures">
        {isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement des structures...
          </div>
        ) : structures.length === 0 ? (
          <div className="flex flex-col items-start gap-4 p-4">
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez encore aucune structure.
            </p>
            <Link href="/owner/team">
              <Button>
                <PlusCircle className="size-4" />
                Créer une structure
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {structures.map((structure) => {
              const statut = STATUT_LABELS[structure.statut] ?? {
                label: structure.statut,
                variant: "outline" as const,
              };
              return (
                <li key={structure.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Building2 className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-medium">{structure.nom}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {structure.type} · {structure.adresse || "Adresse non renseignée"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statut.variant}>{statut.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Actions rapides">
        <div className="flex flex-wrap gap-3">
          <Link href="/owner/team">
            <Button variant="outline">
              <PlusCircle className="size-4" />
              Créer une structure
            </Button>
          </Link>
          <Link href="/owner/team">
            <Button variant="outline">
              <UserPlus className="size-4" />
              Pre-enregistrer un collaborateur
            </Button>
          </Link>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
