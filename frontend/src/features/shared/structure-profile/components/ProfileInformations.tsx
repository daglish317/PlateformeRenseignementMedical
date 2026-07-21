"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StructureProfile } from "../types/structure-profile";

interface ProfileInformationsProps {
  structure: StructureProfile;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

const typeLabels: Record<StructureProfile["type"], string> = {
  HOPITAL: "Hôpital",
  PHARMACIE: "Pharmacie",
};

export function ProfileInformations({
  structure,
  isEditing,
  onFieldChange,
  errors,
}: ProfileInformationsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom</Label>
        {isEditing ? (
          <Input
            id="nom"
            value={structure.nom}
            onChange={(e) => onFieldChange("nom", e.target.value)}
          />
        ) : (
          <p className="text-sm">{structure.nom}</p>
        )}
        {errors?.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <p className="text-sm">{typeLabels[structure.type]}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        {isEditing ? (
          <Input
            id="adresse"
            value={structure.adresse}
            onChange={(e) => onFieldChange("adresse", e.target.value)}
          />
        ) : (
          <p className="text-sm">{structure.adresse}</p>
        )}
        {errors?.adresse && <p className="text-sm text-destructive">{errors.adresse}</p>}
      </div>
    </div>
  );
}
