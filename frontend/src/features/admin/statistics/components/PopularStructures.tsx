"use client";

import { Hospital, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PopularStructure } from "../types/statistics";

interface PopularStructuresProps {
  data: PopularStructure[];
}

function TypeBadge({ type }: { type: "HOPITAL" | "PHARMACIE" }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      {type === "HOPITAL" ? (
        <Hospital className="h-3.5 w-3.5 text-red-600" />
      ) : (
        <Pill className="h-3.5 w-3.5 text-green-600" />
      )}
      {type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
    </span>
  );
}

export function PopularStructures({ data }: PopularStructuresProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Structures les plus populaires</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Favoris</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nom}</TableCell>
                <TableCell>
                  <TypeBadge type={item.type} />
                </TableCell>
                <TableCell className="text-right font-medium">{item.favoris_count.toLocaleString("fr-FR")}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
