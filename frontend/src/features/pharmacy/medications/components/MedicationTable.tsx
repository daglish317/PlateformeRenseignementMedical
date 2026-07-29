"use client";
import { MedicationDTO } from "../api/medications.service";

interface MedicationTableProps {
  medications: MedicationDTO[];
}

export function MedicationTable({ medications }: MedicationTableProps) {
  if (medications.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Aucun médicament enregistré.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Nom</th>
            <th className="pb-2 font-medium">Quantité</th>
            <th className="pb-2 font-medium">Disponible</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((med) => (
            <tr key={med.id} className="border-b last:border-0">
              <td className="py-2 font-medium">{med.nom}</td>
              <td className="py-2">
                <span className={med.quantite > 0 ? "text-foreground" : "text-destructive"}>
                  {med.quantite}
                </span>
              </td>
              <td className="py-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  med.disponible
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {med.disponible ? "Oui" : "Non"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
