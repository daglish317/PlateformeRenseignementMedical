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
import { TechnicalPlatform } from "../types/technical-platform";

interface TechnicalPlatformTableProps {
  platforms: TechnicalPlatform[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TechnicalPlatformTable({
  platforms,
  onDelete,
  isDeleting,
}: TechnicalPlatformTableProps) {
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
        {platforms.map((platform) => (
          <TableRow key={platform.id}>
            <TableCell>{platform.service.nom}</TableCell>
            <TableCell>{platform.service.type}</TableCell>
            <TableCell>
              <Badge variant={platform.disponible ? "default" : "secondary"}>
                {platform.disponible ? "Disponible" : "Indisponible"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(platform.id)}
                disabled={isDeleting || !platform.disponible}
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
