"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TopSearch } from "../types/statistics";

interface TopSearchesProps {
  data: TopSearch[];
}

export function TopSearches({ data }: TopSearchesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Recherches les plus fréquentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recherche</TableHead>
              <TableHead className="text-right">Nombre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.query}>
                <TableCell>{item.query}</TableCell>
                <TableCell className="text-right font-medium">{item.count.toLocaleString("fr-FR")}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
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
