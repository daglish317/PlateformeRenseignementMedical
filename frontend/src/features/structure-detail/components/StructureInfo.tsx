import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { StructureDetail } from "../types/structure-detail";

export default function StructureInfo({ structure }: { structure: StructureDetail }) {
  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
      <h2 className="text-2xl font-bold mb-6">Informations pratiques</h2>
      <div className="space-y-5">
        <div className="flex items-start gap-4 text-foreground">
          <div className="bg-primary/10 p-3 rounded-full shrink-0">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <span className="mt-2 text-lg leading-relaxed">{structure.adresse}</span>
        </div>
        
        {structure.telephone && (
          <div className="flex items-center gap-4 text-foreground">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg">{structure.telephone}</span>
          </div>
        )}
        
        {structure.email && (
          <div className="flex items-center gap-4 text-foreground">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg">{structure.email}</span>
          </div>
        )}
        
        {structure.ouverture && (
          <div className="flex items-start gap-4 text-foreground">
            <div className="bg-primary/10 p-3 rounded-full shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <span className="mt-2 text-lg leading-relaxed">{structure.ouverture}</span>
          </div>
        )}
      </div>
      
      {structure.description && (
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-muted-foreground text-lg leading-relaxed">{structure.description}</p>
        </div>
      )}
    </div>
  );
}
