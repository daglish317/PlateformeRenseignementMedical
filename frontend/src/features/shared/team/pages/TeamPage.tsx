"use client";

import { FormEvent, useMemo, useState } from "react";
import { Building2, Loader2, Power, PowerOff, UserPlus } from "lucide-react";

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

const statusLabels: Record<StructureMemberStatus, string> = {
  INVITE: "Invite",
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
};

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
  const [role, setRole] = useState("");

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
        role: role.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setNom("");
          setEmail("");
          setRole("");
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
        title="Mon equipe"
        subtitle="Creez vos structures puis assignez leurs gestionnaires et caissiers"
      />

      {!isOwner && (
        <SectionCard>
          <p className="text-sm text-muted-foreground">
            Seul le proprietaire peut creer les structures et inviter les collaborateurs.
          </p>
        </SectionCard>
      )}

      {isOwner && (
        <>
          <SectionCard title="Creer une structure">
            <form onSubmit={handleCreateStructure} className="grid gap-4 md:grid-cols-[1fr_180px_1fr_180px_auto] md:items-end">
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
                  onChange={(event) => setStructureType(event.target.value as "HOPITAL" | "PHARMACIE")}
                  disabled={createStructure.isPending}
                >
                  <option value="PHARMACIE">Pharmacie</option>
                  <option value="HOPITAL">Hopital</option>
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
                <Label htmlFor="structure-phone">Telephone</Label>
                <Input
                  id="structure-phone"
                  value={structureTelephone}
                  onChange={(event) => setStructureTelephone(event.target.value)}
                  placeholder="Telephone"
                  disabled={createStructure.isPending}
                />
              </div>
              <Button type="submit" disabled={!canCreateStructure}>
                {createStructure.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Building2 className="size-4" />
                )}
                Creer
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="Structure selectionnee">
            {ownerStructures.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Chargement des structures...
              </div>
            )}
            {!ownerStructures.isLoading && ownerStructures.data?.results.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Creez d&apos;abord une structure pour pouvoir inviter son equipe.
              </p>
            )}
            {ownerStructures.data && ownerStructures.data.results.length > 0 && (
              <div className="max-w-md space-y-2">
                <Label htmlFor="selected-structure">Structure</Label>
                <Select
                  id="selected-structure"
                  value={effectiveStructureId}
                  onChange={(event) => setSelectedStructureId(event.target.value)}
                >
                  {ownerStructures.data.results.map((structure) => (
                    <option key={structure.id} value={structure.id}>
                      {structure.nom} - {structure.type}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Pre-enregistrer un collaborateur">
            <form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
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
                <Label htmlFor="team-role">Role (optionnel)</Label>
                <Input
                  id="team-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Ex: Caissier, Gestionnaire, Assistant..."
                  disabled={inviteMember.isPending || !effectiveStructureId}
                />
              </div>
              <Button type="submit" disabled={!canInvite}>
                {inviteMember.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                Pre-enregistrer
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Aucun email ne sera envoyÃ©. Le collaborateur crÃ©era lui-mÃªme son
              compte sur la page d&apos;inscription avec cette adresse email.
            </p>
          </SectionCard>
        </>
      )}

      <SectionCard title="Membres de la structure">
        {team.isLoading && effectiveStructureId && (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement des membres...
          </div>
        )}

        {team.isError && (
          <p className="p-4 text-sm text-destructive">
            Impossible de charger l&apos;equipe.
          </p>
        )}

        {!effectiveStructureId && (
          <p className="p-4 text-sm text-muted-foreground">
            Selectionnez une structure pour afficher ses membres.
          </p>
        )}

        {!team.isLoading && !team.isError && effectiveStructureId && team.data?.results.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun membre rattache a cette structure.
          </p>
        )}

        {!team.isLoading && !team.isError && team.data && team.data.results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Nom</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Statut</th>
                  <th className="py-3 pr-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.data.results.map((member) => {
                  const canManageMember =
                    isOwner &&
                    member.role !== "PROPRIETAIRE";
                  const action =
                    member.statut === "SUSPENDU" ? "ACTIVATE" : "DEACTIVATE";
                  const isCurrentMemberUpdating =
                    updateMemberStatus.isPending &&
                    updateMemberStatus.variables?.memberId === member.id;

                  return (
                    <tr key={member.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{member.nom}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{member.email}</td>
                      <td className="py-3 pr-4">
                        {member.role === "PROPRIETAIRE" 
                          ? "Proprietaire" 
                          : member.role || "-"}
                      </td>
                      <td className="py-3 pr-4">{statusLabels[member.statut]}</td>
                      <td className="py-3 pr-4 text-right">
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
                            {action === "DEACTIVATE" ? "Desactiver" : "Activer"}
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
        <SectionCard
          title="Permissions du membre"
          actions={
            effectiveStructureId && editableMembers.length > 0 ? (
              <div className="w-full max-w-sm">
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
                      {member.nom}{member.role ? ` - ${member.role}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null
          }
        >
          {!effectiveStructureId ? (
            <p className="text-sm text-muted-foreground">
              Selectionnez une structure pour charger ses permissions.
            </p>
          ) : editableMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun membre operationnel n&apos;est encore rattache a cette structure.
            </p>
          ) : (
            <MemberPermissionsEditor member={selectedMember} />
          )}
        </SectionCard>
      )}
    </PageContainer>
  );
}
