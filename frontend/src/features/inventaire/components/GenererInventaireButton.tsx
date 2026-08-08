"use client";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2 } from "lucide-react";
import { useGenererInventaire } from "../hooks/useInventaire";

interface GenererInventaireButtonProps {
  structureId: string;
  onGenerated?: (inventaireId: string) => void;
}

export function GenererInventaireButton({
  structureId,
  onGenerated,
}: GenererInventaireButtonProps) {
  const mutation = useGenererInventaire();

  const handleClick = () => {
    if (!structureId) return;
    mutation.mutate(structureId, {
      onSuccess: (inventaire) => onGenerated?.(inventaire.id),
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!structureId || mutation.isPending}
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <ClipboardList className="h-4 w-4" />
          Générer un inventaire
        </>
      )}
    </Button>
  );
}
