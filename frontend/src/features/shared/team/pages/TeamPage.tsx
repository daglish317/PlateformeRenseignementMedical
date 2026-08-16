"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  Power,
  PowerOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { useCreateOwnerStructure } from "@/features/shared/owner-structures/hooks/useCreateOwnerStructure";
import { useOwnerStructures } from "@/features/shared/owner-structures/hooks/useOwnerStructures";
import { MemberPermissionsEditor } from "../components/MemberPermissionsEditor";
import { useInviteStructureMember } from "../hooks/useInviteStructureMember";
import { useStructureTeam } from "../hooks/useStructureTeam";
import { useUpdateStructureMemberStatus } from "../hooks/useUpdateStructureMemberStatus";
import type { StructureMemberStatus } from "../types/team";

type InvitedRole = "GESTIONNAIRE" | "CAISSIER";

const ROLE_LABELS: Record<string, string> = {
  PROPRIETAIRE: "Propriétaire",
  GESTIONNAIRE: "Gestionnaire",
  CAISSIER: "Caissier",
};

const STATUS_LABELS: Record<
  StructureMemberStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "outline" }
> = {
  INVITE: { label: "Invité", variant: "warning" },
  ACTIF: { label: "Actif", variant: "success" },
  SUSPENDU: { label: "Suspendu", variant: "destructive" },
};

function formatRole(role?: string | null) {
  if (!role) return "-";
  return ROLE_LABELS[role] ?? role;
}

export function TeamPage() {
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "PROPRIETAIRE";

  const ownerStructures = useOwnerStructures();
  const createStructure = useCreateOwnerStructure();
  const inviteMember = useInviteStructureMember();
  const updateMemberStatus = useUpdateStructureMemberStatus();

  const [selectedStructureId, setSelectedStructureId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const effectiveStructureId =
    selectedStructureId || ownerStructures.data?.results[0]?.id || "";
  const team = useStructureTeam(effectiveStructureId);

  const [structureNom, setStructureNom] = useState("");
  const [structureType, setStructureType] = useState<"HOPITAL" | "PHARMACIE">("PHARMACIE");
  const [structureAdresse, setStructureAdresse] = useState("");
  const [structureTelephone, setStructureTelephone] = useState("");

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitedRole>("GESTIONNAIRE");

  const editableMembers = useMemo(
    () =>
      (team.data?.results ?? []).filter(
        (member) => member.role !== "PROPRIETAIRE"
      ),
    [team.data?.results]
  );

  const resolvedSelectedMemberId = useMemo(() => {
    if (editableMembers.length === 0) {
      return "";
    }

    if (editableMembers.some((member) => member.id === selectedMemberId)) {
      return selectedMemberId;
    }

    return editableMembers[0].id;
  }, [editableMembers, selectedMemberId]);

  const selectedMember =
    editableMembers.find((member) => member.id === resolvedSelectedMemberId) ?? null;

  const canCreateStructure = useMemo(
    () => isOwner && structureNom.trim().length >= 3 && !createStructure.isPending,
    [createStructure.isPending, isOwner, structureNom]
  );

  const canInvite = useMemo(
    () =>
      isOwner &&
      effectiveStructureId &&
      nom.trim().length >= 3 &&
      email.trim() &&
      !inviteMember.isPending,
    [effectiveStructureId, email, inviteMember.isPending, isOwner, nom]
  );

  function handleCreateStructure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreateStructure) return;

    createStructure.mutate(
      {
        nom: structureNom.trim(),
        type: structureType,
        adresse: structureAdresse.trim(),
        telephone: structureTelephone.trim(),
      },
      {
        onSuccess: ({ data }) => {
          setSelectedStructureId(data.id);
          setSelectedMemberId("");
          setStructureNom("");
          setStructureType("PHARMACIE");
          setStructureAdresse("");
          setStructureTelephone("");
        },
      }
    );
  }

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canInvite) return;

    inviteMember.mutate(
      {
        structure_id: effectiveStructureId,
        nom: nom.trim(),
        email: email.trim(),
        role,
      },
      {
        onSuccess: (data) => {
          setNom("");
          setEmail("");
          setRole("GESTIONNAIRE");
          if (data.data?.id) {
            setSelectedMemberId(data.data.id);
          }
          team.refetch();
        },
      }
    );
  }

  function handleUpdateMemberStatus(
    memberId: string,
    action: "ACTIVATE" | "DEACTIVATE"
  ) {
    updateMemberStatus.mutate(
      { memberId, action },
      {
        onSuccess: () => {
          team.refetch();
        },
      }
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageTitle
        title="Mon équipe"
        subtitle="Créez une structure, pré-enregistrez ses collaborateurs, puis activez leurs modules"
      />

      {!isOwner && (
        <SectionCard>
          <p className="text-sm text-muted-foreground">
            Seul le propriétaire peut créer les structures et inviter les collaborateurs.
          </p>
        </SectionCard>
      )}

      {isOwner && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="Créer une structure">
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="structure-name">Nom</Label>
                  <Input
                    id="structure-name"
                    value={structureNom}
                    onChange={(event) => setStructureNom(event.target.value)}
                    placeholder="Pharmacie Centrale"
                    disabled={createStructure.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="structure-type">Type</Label>
                  <Select
                    id="structure-type"
                    value={structureType}
                    onChange={(event) =>
                      setStructureType(event.target.value as "HOPITAL" | "PHARMACIE")
                    }
                    disabled={createStructure.isPending}
                  >
                    <option value="PHARMACIE">Pharmacie</option>
                    <option value="HOPITAL">Hôpital</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="structure-address">Adresse</Label>
                  <Input
                    id="structure-address"
                    value={structureAdresse}
                    onChange={(event) => setStructureAdresse(event.target.value)}
                    placeholder="Adresse"
                    disabled={createStructure.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="structure-phone">Téléphone</Label>
                  <Input
                    id="structure-phone"
                    value={structureTelephone}
                    onChange={(event) => setStructureTelephone(event.target.value)}
                    placeholder="Téléphone"
                    disabled={createStructure.isPending}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!canCreateStructure}>
                {createStructure.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Building2 className="size-4" />
                )}
                Créer la structure
              </Button>
            </form>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Structure active">
              {ownerStructures.isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement des structures...
                </div>
              )}
              {!ownerStructures.isLoading && ownerStructures.data?.results.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Créez d'abord une structure pour pouvoir inviter son équipe.
                </p>
              )}
              {ownerStructures.data && ownerStructures.data.results.length > 0 && (
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="selected-structure">Structure</Label>
                    <Select
                      id="selected-structure"
                      value={effectiveStructureId}
                      onChange={(event) => {
                        setSelectedStructureId(event.target.value);
                        setSelectedMemberId("");
                      }}
                    >
                      {ownerStructures.data.results.map((structure) => (
                        <option key={structure.id} value={structure.id}>
                          {structure.nom} - {structure.type === "PHARMACIE" ? "Pharmacie" : "Hôpital"}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {team.data?.results.length ?? 0} membre(s)
                  </Badge>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Pré-enregistrer un collaborateur">
              <form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Nom complet</Label>
                  <Input
                    id="team-name"
                    value={nom}
                    onChange={(event) => setNom(event.target.value)}
                    placeholder="Jean Dupont"
                    disabled={inviteMember.isPending || !effectiveStructureId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-email">Adresse email</Label>
                  <Input
                    id="team-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="jean@exemple.com"
                    disabled={inviteMember.isPending || !effectiveStructureId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-role">Rôle</Label>
                  <Select
                    id="team-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as InvitedRole)}
                    disabled={inviteMember.isPending || !effectiveStructureId}
                  >
                    <option value="GESTIONNAIRE">Gestionnaire</option>
                    <option value="CAISSIER">Caissier</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={!canInvite}>
                    {inviteMember.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    Pré-enregistrer
                  </Button>
                </div>
              </form>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Aucun email ne sera envoyé. Le collaborateur créera lui-même son compte
                avec cette adresse, puis le système le redirigera vers son espace.
              </p>
            </SectionCard>
          </div>
        </div>
      )}

      <SectionCard
        title="Membres de la structure"
        actions={
          effectiveStructureId ? (
            <Badge variant="outline">
              {team.data?.results.length ?? 0} collaborateur(s)
            </Badge>
          ) : null
        }
      >
        {team.isLoading && effectiveStructureId && (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement des membres...
          </div>
        )}

        {team.isError && (
          <p className="p-4 text-sm text-destructive">
            Impossible de charger l'équipe.
          </p>
        )}

        {!effectiveStructureId && (
          <p className="p-4 text-sm text-muted-foreground">
            Sélectionnez une structure pour afficher ses membres.
          </p>
        )}

        {!team.isLoading && !team.isError && effectiveStructureId && team.data?.results.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun membre rattaché à cette structure.
          </p>
        )}

        {!team.isLoading && !team.isError && team.data && team.data.results.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.data.results.map((member) => {
                  const canManageMember = isOwner && member.role !== "PROPRIETAIRE";
                  const action =
                    member.statut === "SUSPENDU" ? "ACTIVATE" : "DEACTIVATE";
                  const isCurrentMemberUpdating =
                    updateMemberStatus.isPending &&
                    updateMemberStatus.variables?.memberId === member.id;
                  const status = STATUS_LABELS[member.statut];

                  return (
                    <tr key={member.id} className="border-b bg-background last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{member.nom}</td>
                      <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                      <td className="px-4 py-3">{formatRole(member.role)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManageMember ? (
                          <Button
                            type="button"
                            size="sm"
                            variant={action === "DEACTIVATE" ? "destructive" : "outline"}
                            disabled={isCurrentMemberUpdating}
                            onClick={() => handleUpdateMemberStatus(member.id, action)}
                          >
                            {isCurrentMemberUpdating ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : action === "DEACTIVATE" ? (
                              <PowerOff className="size-4" />
                            ) : (
                              <Power className="size-4" />
                            )}
                            {action === "DEACTIVATE" ? "Désactiver" : "Activer"}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {isOwner && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Permissions du membre</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Activez uniquement les modules que ce collaborateur doit voir.
              </p>
            </div>
            {effectiveStructureId && editableMembers.length > 0 ? (
              <div className="w-full max-w-sm shrink-0">
                <Label htmlFor="member-permissions-select" className="sr-only">
                  Membre
                </Label>
                <Select
                  id="member-permissions-select"
                  value={resolvedSelectedMemberId}
                  onChange={(event) => setSelectedMemberId(event.target.value)}
                >
                  {editableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.nom}
                      {member.role ? ` - ${formatRole(member.role)}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>

          {!effectiveStructureId ? (
            <SectionCard>
              <p className="text-sm text-muted-foreground">
                Sélectionnez une structure pour charger ses permissions.
              </p>
            </SectionCard>
          ) : editableMembers.length === 0 ? (
            <SectionCard>
              <p className="text-sm text-muted-foreground">
                Aucun membre opérationnel n'est encore rattaché à cette structure.
              </p>
            </SectionCard>
          ) : (
            <MemberPermissionsEditor member={selectedMember} />
          )}
        </div>
      )}
    </PageContainer>
  );
}
