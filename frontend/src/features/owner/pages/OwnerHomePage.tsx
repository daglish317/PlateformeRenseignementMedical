"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Hospital,
  Loader2,
  MapPin,
  PlusCircle,
  Store,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";

const STATUT_LABELS: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "outline" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  REFUSEE: { label: "Refusée", variant: "destructive" },
};

const STRUCTURE_VISUALS = {
  PHARMACIE: {
    label: "Pharmacie",
    icon: Store,
    iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    borderTone: "border-l-emerald-500",
  },
  HOPITAL: {
    label: "Hôpital",
    icon: Hospital,
    iconTone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    borderTone: "border-l-blue-500",
  },
} as const;

export function OwnerHomePage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useOwnerStructures();

  const structures = data?.results ?? [];
  const pharmaciesCount = structures.filter((structure) => structure.type === "PHARMACIE").length;
  const hospitalsCount = structures.filter((structure) => structure.type === "HOPITAL").length;
  const activeCount = structures.filter((structure) => structure.statut === "ACTIVE").length;

  const ownerStats = [
    {
      label: "Structures",
      value: structures.length,
      icon: Building2,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Pharmacies",
      value: pharmaciesCount,
      icon: Store,
      tone: STRUCTURE_VISUALS.PHARMACIE.iconTone,
    },
    {
      label: "Hôpitaux",
      value: hospitalsCount,
      icon: Hospital,
      tone: STRUCTURE_VISUALS.HOPITAL.iconTone,
    },
    {
      label: "Actives",
      value: activeCount,
      icon: CheckCircle2,
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
  ];

  return (
    <PageContainer className="space-y-6">
      <PageTitle
        title="Espace propriétaire"
        subtitle="Supervisez vos structures, vos équipes et les permissions opérationnelles"
        actions={
          <Link href="/owner/team">
            <Button>
              <PlusCircle className="size-4" />
              Nouvelle structure
            </Button>
          </Link>
        }
      />

      <SectionCard className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="p-5 md:p-6">
            <Badge variant="secondary" className="mb-4">
              Pilotage SantéProx
            </Badge>
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
              Bienvenue, {user?.nom ?? "Propriétaire"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Créez vos structures, pré-enregistrez les gestionnaires et caissiers,
              puis activez précisément les modules visibles dans leurs espaces.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ownerStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-semibold">{stat.value}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t bg-[var(--dashboard-brand-panel)] p-5 xl:border-l xl:border-t-0 md:p-6">
            <p className="text-sm font-medium">Actions rapides</p>
            <div className="mt-4 grid gap-3">
              <Link href="/owner/team">
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="size-4" />
                  Créer une structure
                </Button>
              </Link>
              <Link href="/owner/team">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="size-4" />
                  Pré-enregistrer un collaborateur
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Le collaborateur ne reçoit pas d'email. Il crée son compte avec
              l'adresse pré-enregistrée et arrive dans l'espace autorisé.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Vos structures">
        {isLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement des structures...
          </div>
        ) : structures.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed p-5">
            <p className="text-sm text-muted-foreground">
              Vous n'avez encore aucune structure.
            </p>
            <Link href="/owner/team">
              <Button>
                <PlusCircle className="size-4" />
                Créer une structure
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {structures.map((structure) => {
              const statut = STATUT_LABELS[structure.statut] ?? {
                label: structure.statut,
                variant: "outline" as const,
              };
              const visual = STRUCTURE_VISUALS[structure.type];
              const Icon = visual.icon;

              return (
                <div
                  key={structure.id}
                  className={`flex flex-col gap-4 rounded-lg border border-l-4 bg-background p-4 transition-all hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-sm md:flex-row md:items-center md:justify-between ${visual.borderTone}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${visual.iconTone}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{structure.nom}</p>
                        <Badge variant="outline">{visual.label}</Badge>
                      </div>
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {structure.adresse || "Adresse non renseignée"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge variant={statut.variant}>{statut.label}</Badge>
                    <Link href="/owner/team">
                      <Button variant="ghost" size="sm">
                        Gérer
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
