"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareService } from "../types/care-service";

interface CareServiceTableProps {
  careServices: CareService[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function CareServiceTable({ careServices, onDelete, isDeleting }: CareServiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Nom</th>
            <th className="pb-2 font-medium">Niveau</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {careServices.map((cs) => (
            <tr key={cs.id} className="border-b last:border-0">
              <td className="py-2">{cs.service.nom}</td>
              <td className="py-2">
                <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {cs.niveau || "Non spécifié"}
                </span>
              </td>
              <td className="py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(cs.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
