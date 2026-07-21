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
import { Analysis } from "../types/analysis";

interface AnalysisTableProps {
  analyses: Analysis[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AnalysisTable({ analyses, onDelete, isDeleting }: AnalysisTableProps) {
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
        {analyses.map((analysis) => (
          <TableRow key={analysis.id}>
            <TableCell>{analysis.catalogue.nom}</TableCell>
            <TableCell>{analysis.catalogue.type}</TableCell>
            <TableCell>
              <Badge variant={analysis.actif ? "default" : "secondary"}>
                {analysis.actif ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(analysis.id)}
                disabled={isDeleting || !analysis.actif}
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
