"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, ShieldOff, UsersRound } from "lucide-react";

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
  FACTURE: "Facture",
  INVENTAIRE: "Inventaire",
  ALERTES: "Alertes",
  PEREMPTION: "Péremption",
  HISTORIQUE: "Historique",
  STATISTIQUES: "Statistiques",
  HORAIRES: "Horaires",
  NOTIFICATIONS: "Notifications",
  PROFIL: "Profil",
  PARAMETRES: "Paramètres",
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
  RETOUR_CAISSE: "Retour en caisse",
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
    title: "Gestion et accès",
    modules: ["HORAIRES", "NOTIFICATIONS", "PROFIL", "PARAMETRES"],
  },
];

function clonePermissions(input: TeamPermissionMap | undefined): TeamPermissionMap {
  const next: TeamPermissionMap = {};
  if (!input) return next;

  for (const [module, actions] of Object.entries(input) as Array<
    [ModuleOperationnel, ActionPermission[] | undefined]
  >) {
    next[module] = [...new Set(actions ?? [])];
  }
  return next;
}

function isEditableRole(role?: StructureTeamMember["role"]) {
  return role === "GESTIONNAIRE" || role === "CAISSIER";
}

interface MemberPermissionsEditorContentProps {
  structureId: string;
  permissions: TeamPermissionMap;
  modules: Array<{
    module: ModuleOperationnel;
    actions: ActionPermission[];
  }>;
  isSaving: boolean;
  onSave: (permissions: TeamPermissionMap) => void;
}

function MemberPermissionsEditorContent({
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
  const baselinePermissions = clonePermissions(permissions);
  const isChanged =
    JSON.stringify(draftPermissions) !== JSON.stringify(baselinePermissions);
  const hasAnyPermission = Object.values(draftPermissions).some(
    (actions) => (actions?.length ?? 0) > 0
  );

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

  return (
    <SectionCard
      title="Permissions du membre"
      actions={
        <div className="flex items-center gap-2">
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
            onClick={() => onSave(draftPermissions)}
            disabled={!editable || !isChanged}
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
      <p className="mb-4 text-sm text-muted-foreground">
        Les modules et actions sont contrôlés par le propriétaire pour la structure{" "}
        <span className="font-medium">{structureId}</span>.
        Messagerie n&apos;est pas attribuable aux membres opérationnels.
      </p>

      <div className="space-y-6">
        {!hasAnyPermission && (
          <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-5" />
            <p>
              Ce membre n&apos;a encore aucun module activé. Le propriétaire doit
              au moins lui accorder une permission pour qu&apos;il voie un espace
              opérationnel cohérent.
            </p>
          </div>
        )}

        {MODULE_GROUPS.map((group) => {
          const groupModules = modules.filter(({ module }) =>
            group.modules.includes(module)
          );

          if (groupModules.length === 0) return null;

          return (
            <div key={group.title} className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </h4>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {groupModules.map(({ module, actions }) => {
                  const currentActions = new Set(draftPermissions[module] ?? []);
                  return (
                    <div key={module} className="rounded-lg border p-4">
                      <div className="mb-3">
                        <h5 className="font-medium">{MODULE_LABELS[module] ?? module}</h5>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {actions.map((action) => {
                          const checked = currentActions.has(action);
                          return (
                            <label
                              key={`${module}-${action}`}
                              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(module, action)}
                                disabled={!editable}
                                className="h-4 w-4 rounded border-input"
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
