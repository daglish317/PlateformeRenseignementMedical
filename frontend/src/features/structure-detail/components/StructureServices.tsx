import type { StructureDetail } from "../types/structure-detail";
import { CheckCircle2 } from "lucide-react";

export default function StructureServices({ structure }: { structure: StructureDetail }) {
  if (!structure.services || structure.services.length === 0) return null;

  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <h2 className="text-2xl font-bold mb-6">Services proposés</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {structure.services.map((service) => (
          <li key={service.id} className="flex items-center gap-3 text-foreground bg-muted/30 p-4 rounded-xl">
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
            <span className="font-medium text-lg">{service.nom}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
