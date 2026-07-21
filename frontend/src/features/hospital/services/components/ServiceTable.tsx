"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { MedicalService } from "../types/service";

interface ServiceTableProps {
  services: MedicalService[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ServiceTable({ services, onDelete, isDeleting }: ServiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell>{service.catalogue.nom}</TableCell>
            <TableCell>{service.catalogue.type}</TableCell>
            <TableCell>
              <Badge variant={service.actif ? "default" : "secondary"}>
                {service.actif ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(service.id)}
                disabled={isDeleting || !service.actif}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
