"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Analysis } from "../types/analysis";

interface AnalysisTableProps {
  analyses: Analysis[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AnalysisTable({ analyses, onDelete, isDeleting }: AnalysisTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Nom</th>
            <th className="pb-2 font-medium">Disponible</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis) => (
            <tr key={analysis.id} className="border-b last:border-0">
              <td className="py-2">{analysis.service.nom}</td>
              <td className="py-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  analysis.disponible
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {analysis.disponible ? "Oui" : "Non"}
                </span>
              </td>
              <td className="py-2">
                {analysis.disponible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(analysis.id)}
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
