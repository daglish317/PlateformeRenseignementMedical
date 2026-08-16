"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldOff,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useMemberPermissions } from "../hooks/useMemberPermissions";
import { usePermissionRegistry } from "../hooks/usePermissionRegistry";
import { useUpdateTeamPermissions } from "../hooks/useUpdateTeamPermissions";
import type { StructureTeamMember, TeamPermissionMap } from "../types/team";
import type {
  ActionPermission,
  ModuleOperationnel,
} from "@/features/shared/dashboard/types/permissions";

const MODULE_LABELS: Record<string, string> = {
  APPROVISIONNEMENT: "Approvisionnement",
  STOCK: "Stock",
  VENTE: "Vente",
  CAISSE: "Caisse",
  FACTURE: "Factures",
  INVENTAIRE: "Inventaires",
  ALERTES: "Alertes",
  PEREMPTION: "Péremption",
  HISTORIQUE: "Historique",
  STATISTIQUES: "Statistiques",
  HORAIRES: "Horaires",
  NOTIFICATIONS: "Notifications",
  PROFIL: "Profil",
  PARAMETRES: "Paramètres",
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  APPROVISIONNEMENT: "Réception des lots, entrées de stock et suivi fournisseur.",
  STOCK: "Catalogue, quantités, seuils et disponibilité des médicaments.",
  VENTE: "Ventes au comptoir et sorties liées aux clients.",
  CAISSE: "Encaissements, retours, reçus et validation des paiements.",
  FACTURE: "Consultation, impression et export des factures.",
  INVENTAIRE: "Contrôles physiques, écarts et ajustements de stock.",
  ALERTES: "Ruptures, péremptions, caisse et incidents opérationnels.",
  PEREMPTION: "Lots proches de l'expiration et traitements associés.",
  HISTORIQUE: "Journal des actions et traçabilité de la structure.",
  STATISTIQUES: "Indicateurs, exports et analyse de performance.",
  HORAIRES: "Horaires d'ouverture et disponibilité publique.",
  NOTIFICATIONS: "Alertes reçues sur le compte de l'utilisateur.",
  PROFIL: "Informations personnelles du compte connecté.",
  PARAMETRES: "Préférences et sécurité du compte.",
};

const ACTION_LABELS: Record<ActionPermission, string> = {
  CONSULTER: "Consulter",
  CREER: "Créer",
  MODIFIER: "Modifier",
  SUPPRIMER: "Supprimer",
  EXPORTER: "Exporter",
  IMPRIMER: "Imprimer",
  FILTRER: "Filtrer",
  RECHERCHER: "Rechercher",
  ANNULER: "Annuler",
  VALIDER_PAIEMENT: "Valider paiement",
  REFUSER_PAIEMENT: "Refuser paiement",
  IMPRIMER_RECU: "Imprimer reçu",
  RETOUR_CAISSE: "Retour caisse",
};

const MODULE_ORDER: ModuleOperationnel[] = [
  "APPROVISIONNEMENT",
  "STOCK",
  "VENTE",
  "CAISSE",
  "FACTURE",
  "INVENTAIRE",
  "ALERTES",
  "PEREMPTION",
  "HISTORIQUE",
  "STATISTIQUES",
  "HORAIRES",
  "NOTIFICATIONS",
  "PROFIL",
  "PARAMETRES",
];

const MODULE_GROUPS: Array<{ title: string; modules: ModuleOperationnel[] }> = [
  {
    title: "Opérations métier",
    modules: ["APPROVISIONNEMENT", "STOCK", "VENTE", "CAISSE", "FACTURE"],
  },
  {
    title: "Suivi et contrôle",
    modules: ["INVENTAIRE", "ALERTES", "PEREMPTION", "HISTORIQUE", "STATISTIQUES"],
  },
  {
    title: "Compte et exploitation",
    modules: ["HORAIRES", "NOTIFICATIONS", "PROFIL", "PARAMETRES"],
  },
];

const GESTIONNAIRE_TEMPLATE: TeamPermissionMap = {
  APPROVISIONNEMENT: ["CONSULTER", "CREER", "MODIFIER", "RECHERCHER", "FILTRER"],
  STOCK: ["CONSULTER", "CREER", "MODIFIER", "RECHERCHER", "FILTRER", "EXPORTER"],
  VENTE: ["CONSULTER", "CREER", "MODIFIER", "ANNULER", "RECHERCHER", "FILTRER"],
  CAISSE: [
    "CONSULTER",
    "VALIDER_PAIEMENT",
    "REFUSER_PAIEMENT",
    "IMPRIMER_RECU",
    "RETOUR_CAISSE",
  ],
  FACTURE: ["CONSULTER", "IMPRIMER", "EXPORTER", "RECHERCHER", "FILTRER"],
  INVENTAIRE: ["CONSULTER", "CREER", "MODIFIER", "EXPORTER"],
  ALERTES: ["CONSULTER", "MODIFIER"],
  PEREMPTION: ["CONSULTER", "MODIFIER", "EXPORTER"],
  HISTORIQUE: ["CONSULTER", "EXPORTER", "RECHERCHER", "FILTRER"],
  STATISTIQUES: ["CONSULTER", "EXPORTER", "FILTRER"],
  HORAIRES: ["CONSULTER", "MODIFIER"],
  NOTIFICATIONS: ["CONSULTER"],
  PROFIL: ["CONSULTER", "MODIFIER"],
  PARAMETRES: ["CONSULTER", "MODIFIER"],
};

const CAISSIER_TEMPLATE: TeamPermissionMap = {
  STOCK: ["CONSULTER", "RECHERCHER"],
  VENTE: ["CONSULTER", "CREER", "ANNULER", "RECHERCHER"],
  CAISSE: ["CONSULTER", "VALIDER_PAIEMENT", "IMPRIMER_RECU", "RETOUR_CAISSE"],
  FACTURE: ["CONSULTER", "IMPRIMER", "RECHERCHER"],
  HISTORIQUE: ["CONSULTER", "RECHERCHER"],
  NOTIFICATIONS: ["CONSULTER"],
  PROFIL: ["CONSULTER", "MODIFIER"],
  PARAMETRES: ["CONSULTER"],
};

type RegistryModule = {
  module: ModuleOperationnel;
  actions: ActionPermission[];
};

function clonePermissions(input: TeamPermissionMap | undefined): TeamPermissionMap {
  const next: TeamPermissionMap = {};
  if (!input) return next;

  for (const [module, actions] of Object.entries(input) as Array<
    [ModuleOperationnel, ActionPermission[] | undefined]
  >) {
    if (actions?.length) {
      next[module] = [...new Set(actions)];
    }
  }

  return next;
}

function normalizePermissions(input: TeamPermissionMap): TeamPermissionMap {
  const next: TeamPermissionMap = {};

  for (const module of MODULE_ORDER) {
    const actions = input[module];
    if (actions?.length) {
      next[module] = [...new Set(actions)].sort();
    }
  }

  return next;
}

function countPermissions(input: TeamPermissionMap) {
  return Object.values(input).reduce((total, actions) => total + (actions?.length ?? 0), 0);
}

function countModules(input: TeamPermissionMap) {
  return Object.values(input).filter((actions) => (actions?.length ?? 0) > 0).length;
}

function applyTemplate(
  template: TeamPermissionMap,
  modules: RegistryModule[]
): TeamPermissionMap {
  const availableByModule = new Map(
    modules.map(({ module, actions }) => [module, new Set(actions)])
  );
  const next: TeamPermissionMap = {};

  for (const [module, actions] of Object.entries(template) as Array<
    [ModuleOperationnel, ActionPermission[] | undefined]
  >) {
    const availableActions = availableByModule.get(module);
    if (!availableActions) continue;

    const allowedActions = (actions ?? []).filter((action) => availableActions.has(action));
    if (allowedActions.length) {
      next[module] = allowedActions;
    }
  }

  return next;
}

function isEditableRole(role?: StructureTeamMember["role"]) {
  return role === "GESTIONNAIRE" || role === "CAISSIER";
}

interface MemberPermissionsEditorContentProps {
  member: StructureTeamMember;
  structureId: string;
  permissions: TeamPermissionMap;
  modules: RegistryModule[];
  isSaving: boolean;
  onSave: (permissions: TeamPermissionMap) => void;
}

function MemberPermissionsEditorContent({
  member,
  structureId,
  permissions,
  modules,
  isSaving,
  onSave,
}: MemberPermissionsEditorContentProps) {
  const [draftPermissions, setDraftPermissions] = useState<TeamPermissionMap>(() =>
    clonePermissions(permissions)
  );

  const editable = !isSaving;
  const baselinePermissions = normalizePermissions(clonePermissions(permissions));
  const normalizedDraft = normalizePermissions(draftPermissions);
  const isChanged = JSON.stringify(normalizedDraft) !== JSON.stringify(baselinePermissions);
  const activeModules = countModules(draftPermissions);
  const activePermissions = countPermissions(draftPermissions);
  const hasAnyPermission = activePermissions > 0;

  const togglePermission = (module: ModuleOperationnel, action: ActionPermission) => {
    setDraftPermissions((current) => {
      const actions = new Set(current[module] ?? []);
      if (actions.has(action)) {
        actions.delete(action);
      } else {
        actions.add(action);
      }

      return {
        ...current,
        [module]: Array.from(actions),
      };
    });
  };

  const setModuleActions = (
    module: ModuleOperationnel,
    actions: ActionPermission[]
  ) => {
    setDraftPermissions((current) => ({
      ...current,
      [module]: actions,
    }));
  };

  const handleApplyTemplate = (template: TeamPermissionMap) => {
    setDraftPermissions(applyTemplate(template, modules));
  };

  return (
    <SectionCard
      title="Permissions du membre"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDraftPermissions(clonePermissions(permissions))}
            disabled={!editable || !isChanged}
          >
            Réinitialiser
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onSave(normalizedDraft)}
            disabled={!editable || !isChanged || !hasAnyPermission}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UsersRound className="size-4" />
            )}
            Enregistrer
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{member.nom}</Badge>
              <Badge variant="outline">{member.role}</Badge>
              <Badge variant={hasAnyPermission ? "success" : "warning"}>
                {activeModules} module(s) actif(s)
              </Badge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Les modules cochés ici sont les seuls qui apparaîtront dans l'espace
              du collaborateur. La structure liée est <span className="font-medium">{structureId}</span>.
              La messagerie reste réservée au propriétaire, au gestionnaire d'hôpital
              et à l'administration SantéProx.
            </p>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <p className="text-sm font-medium">Modèles rapides</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate(GESTIONNAIRE_TEMPLATE)}
                disabled={!editable}
              >
                Modèle gestionnaire
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate(CAISSIER_TEMPLATE)}
                disabled={!editable}
              >
                Modèle caissier
              </Button>
            </div>
          </div>
        </div>

        {!hasAnyPermission && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
            <AlertCircle className="mt-0.5 size-5" />
            <p>
              Ce membre n'a encore aucun module actif. Activez au moins un module
              avant d'enregistrer pour éviter un dashboard vide ou incohérent.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {MODULE_GROUPS.map((group) => {
            const groupModules = modules.filter(({ module }) =>
              group.modules.includes(module)
            );

            if (groupModules.length === 0) return null;

            return (
              <div key={group.title} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </h4>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {groupModules.map(({ module, actions }) => {
                    const currentActions = new Set(draftPermissions[module] ?? []);
                    const allModuleActionsEnabled =
                      actions.length > 0 && actions.every((action) => currentActions.has(action));
                    const moduleActive = currentActions.size > 0;

                    return (
                      <div
                        key={module}
                        className="rounded-lg border bg-background p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-medium">
                                {MODULE_LABELS[module] ?? module}
                              </h5>
                              <Badge variant={moduleActive ? "success" : "outline"}>
                                {currentActions.size}/{actions.length}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {MODULE_DESCRIPTIONS[module] ?? "Module opérationnel."}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setModuleActions(module, actions)}
                              disabled={!editable || allModuleActionsEnabled}
                            >
                              Tout activer
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setModuleActions(module, [])}
                              disabled={!editable || !moduleActive}
                            >
                              Vider
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {actions.map((action) => {
                            const checked = currentActions.has(action);
                            return (
                              <label
                                key={`${module}-${action}`}
                                className={`flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                                  checked
                                    ? "border-primary/40 bg-primary/10 text-foreground"
                                    : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(module, action)}
                                  disabled={!editable}
                                  className="h-4 w-4 rounded border-input accent-primary"
                                />
                                <span>{ACTION_LABELS[action] ?? action}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 text-success" />
            <p>
              {activePermissions} permission(s) active(s). Les changements sont pris
              en compte après enregistrement et actualisation des permissions côté utilisateur.
            </p>
          </div>
          {isChanged && (
            <Badge variant="warning" className="w-fit">
              Modifications non enregistrées
            </Badge>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

interface MemberPermissionsEditorProps {
  member: StructureTeamMember | null;
}

export function MemberPermissionsEditor({ member }: MemberPermissionsEditorProps) {
  const permissionsQuery = useMemberPermissions(member?.id);
  const registryQuery = usePermissionRegistry();
  const updateMutation = useUpdateTeamPermissions(member?.id);

  const modules = useMemo(() => {
    const registry = registryQuery.data?.modules ?? {};
    return MODULE_ORDER.filter((module) => registry[module]?.length).map((module) => ({
      module,
      actions: registry[module] as ActionPermission[],
    }));
  }, [registryQuery.data?.modules]);

  if (!member) {
    return (
      <SectionCard title="Permissions du membre">
        <p className="text-sm text-muted-foreground">
          Sélectionnez un membre pour consulter et modifier ses permissions.
        </p>
      </SectionCard>
    );
  }

  if (!isEditableRole(member.role)) {
    return (
      <SectionCard title="Permissions du membre">
        <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
          <ShieldOff className="mt-0.5 size-5 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">{member.nom}</p>
            <p className="text-sm text-muted-foreground">
              Les permissions du propriétaire ne sont pas modifiables depuis cet écran.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  if (permissionsQuery.isLoading || registryQuery.isLoading) {
    return (
      <SectionCard title="Permissions du membre">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement des permissions...
        </div>
      </SectionCard>
    );
  }

  if (permissionsQuery.isError || registryQuery.isError || !permissionsQuery.data) {
    return (
      <SectionCard title="Permissions du membre">
        <p className="text-sm text-destructive">
          Impossible de charger les permissions de ce membre.
        </p>
      </SectionCard>
    );
  }

  const permissionsSignature = JSON.stringify(permissionsQuery.data.permissions);

  return (
    <MemberPermissionsEditorContent
      key={`${member.id}:${permissionsSignature}`}
      member={member}
      structureId={permissionsQuery.data.structure_id}
      permissions={permissionsQuery.data.permissions}
      modules={modules}
      isSaving={updateMutation.isPending}
      onSave={(permissions) => {
        if (!isEditableRole(member.role)) return;
        updateMutation.mutate({ permissions });
      }}
    />
  );
}
