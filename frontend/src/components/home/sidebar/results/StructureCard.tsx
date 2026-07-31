
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Footprints, MapPin, Hospital, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { useStructureSelectionStore } from "@/features/structure-selection/store/structure-selection-store";
import { useRoute } from "@/features/routing/hooks/useRoute";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";
import { cn } from "@/lib/utils";

type StructureCardProps = {
  result: SearchResult;
};

export default function StructureCard({ result }: StructureCardProps) {
  const { structure, distance_km, walking_time, driving_time } = result;
  const setSelectedStructure = useStructureSelectionStore((state) => state.setSelectedStructure);
  const selectedStructure = useStructureSelectionStore((state) => state.selectedStructure);

  const { calculateRoute, loading: routeLoading } = useRoute();
  const { locateUser } = useCurrentLocation();

  const isSelected = selectedStructure?.id === structure.id;
  const isHopital = structure.type === "HOPITAL";

  // Accent propre au type de structure : repérable au premier coup d'oeil,
  // avant même de lire le libellé.
  const accent = isHopital
    ? {
        bar: "bg-red-500",
        badge: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        iconBg: "bg-red-50 dark:bg-red-500/10",
        icon: "text-red-500",
      }
    : {
        bar: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        icon: "text-emerald-500",
      };

  const handleRoute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const position = await locateUser();
    if (position) {
      calculateRoute({
        startLat: position.latitude,
        startLng: position.longitude,
        endLat: structure.latitude,
        endLng: structure.longitude,
      });
    }
  };

  return (
    <article
      onClick={() => setSelectedStructure(structure)}
      className={`
        relative flex cursor-pointer gap-3 overflow-hidden rounded-xl border bg-card p-3
        pl-4 transition-all hover:shadow-md
        ${isSelected ? "border-primary ring-1 ring-primary" : "border-border"}
      `}
    >
      {/* Bandeau couleur par type */}
      <span className={cn("absolute inset-y-0 left-0 w-1.5", accent.bar)} />

      {/* Photo */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {structure.photo ? (
          <Image
            src={structure.photo}
            alt={structure.nom}
            fill
            className="object-cover"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center", accent.iconBg)}>
            {isHopital ? (
              <Hospital className={cn("h-8 w-8", accent.icon)} />
            ) : (
              <Pill className={cn("h-8 w-8", accent.icon)} />
            )}
          </div>
        )}
        <div className="absolute bottom-1 left-1">
          <Badge className={cn("border-0 px-1.5 py-0 text-[10px] leading-4", accent.badge)}>
            {isHopital ? "Hôpital" : "Pharmacie"}
          </Badge>
        </div>
      </div>

      {/* Infos */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
            {structure.nom}
          </h3>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <FavoriteButton structureId={structure.id} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {distance_km !== null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {distance_km} km
            </span>
          )}
          {walking_time !== null && (
            <span className="flex items-center gap-1">
              <Footprints className="h-3 w-3" />
              {walking_time} min
            </span>
          )}
          {driving_time !== null && (
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              {driving_time} min
            </span>
          )}
        </div>

        {structure.adresse && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {structure.adresse}
          </p>
        )}

        <div className="mt-auto flex gap-1.5 pt-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-lg px-2.5 text-xs"
            onClick={handleRoute}
            disabled={routeLoading}
          >
            <MapPin className="mr-1 h-3 w-3" />
            {routeLoading ? "..." : "Itinéraire"}
          </Button>
          <Link
            href={`/structure/${structure.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              className="h-7 rounded-lg px-2.5 text-xs"
            >
              Détails
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}