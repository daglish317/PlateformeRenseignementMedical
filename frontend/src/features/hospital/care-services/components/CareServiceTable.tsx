"use client";
import { CareService } from "../types/care-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CareServiceTableProps {
  careServices: CareService[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function CareServiceTable({ careServices, onDelete, isDeleting }: CareServiceTableProps) {
  if (careServices.length === 0) {
    return <p className="text-muted-foreground p-4">Aucune prise en charge enregistrée.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3 font-medium">Nom</th>
            <th className="p-3 font-medium">Type</th>
            <th className="p-3 font-medium">Statut</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {careServices.map((cs) => (
            <tr key={cs.id} className="border-b">
              <td className="p-3">{cs.catalogue.nom}</td>
              <td className="p-3">{cs.catalogue.type}</td>
              <td className="p-3">
                <Badge variant={cs.actif ? "default" : "secondary"}>
                  {cs.actif ? "Actif" : "Inactif"}
                </Badge>
              </td>
              <td className="p-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onDelete(cs.id)} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
