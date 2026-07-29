"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalService } from "../types/service";

interface ServiceTableProps {
  services: MedicalService[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ServiceTable({ services, onDelete, isDeleting }: ServiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Nom</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Statut</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b last:border-0">
              <td className="py-2">{service.service.nom}</td>
              <td className="py-2">{service.service.type}</td>
              <td className="py-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  service.actif
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {service.actif ? "Actif" : "Inactif"}
                </span>
              </td>
              <td className="py-2">
                {service.actif && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(service.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
