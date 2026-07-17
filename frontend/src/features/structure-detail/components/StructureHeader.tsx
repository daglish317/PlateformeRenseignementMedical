import Image from "next/image";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";
import type { StructureDetail } from "../types/structure-detail";
import { Hospital, Pill } from "lucide-react";

export default function StructureHeader({ structure }: { structure: StructureDetail }) {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-3xl bg-muted shadow-sm">
      {structure.photo ? (
        <Image src={structure.photo} alt={structure.nom} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/5">
          {structure.type === "HOPITAL" ? (
            <Hospital className="h-20 w-20 text-primary/40" />
          ) : (
            <Pill className="h-20 w-20 text-primary/40" />
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-md">{structure.nom}</h1>
          <span className="inline-block bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
          </span>
        </div>
        <div className="bg-background rounded-full p-2 shadow-lg">
          <FavoriteButton structureId={structure.id} />
        </div>
      </div>
    </div>
  );
}
