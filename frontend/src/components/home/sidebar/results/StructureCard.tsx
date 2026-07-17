"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Footprints, MapPin, Hospital, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/types/search";
import { useStructureSelectionStore } from "@/features/structure-selection/store/structure-selection-store";
import { useRoute } from "@/features/routing/hooks/useRoute";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";

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
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        bg-card
        p-4
        shadow-sm
        transition-all
        hover:shadow-md
        ${isSelected ? "border-primary ring-1 ring-primary" : "border-border"}
      `}
    >
      <div className="flex gap-4">
        {/* ============================
            Photo
        ============================ */}
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          {structure.photo ? (
            <Image
              src={structure.photo}
              alt={structure.nom}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5">
              {structure.type === "HOPITAL" ? (
                <Hospital className="h-10 w-10 text-primary" />
              ) : (
                <Pill className="h-10 w-10 text-primary" />
              )}
            </div>
          )}
        </div>

        {/* ============================
            Informations
        ============================ */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
              {structure.nom}
            </h3>
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton structureId={structure.id} />
            </div>
          </div>

          <span className="mt-1 text-sm font-medium text-primary">
            {structure.type === "HOPITAL" ? "Hôpital" : "Pharmacie"}
          </span>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {distance_km !== null && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{distance_km} km</span>
              </div>
            )}

            {walking_time !== null && (
              <div className="flex items-center gap-1">
                <Footprints className="h-4 w-4" />
                <span>{walking_time} min</span>
              </div>
            )}

            {driving_time !== null && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{driving_time} min</span>
              </div>
            )}
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {structure.adresse}
          </p>

          <div className="mt-auto pt-4 flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl inline-flex items-center gap-2 mt-4"
              onClick={handleRoute}
              disabled={routeLoading}
            >
              {routeLoading ? "Calcul..." : "Itinéraire"}
              <MapPin className="h-4 w-4" />
            </Button>
            <Link
              href={`/structure/${structure.id}`}
              className="inline-block mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                className="rounded-xl inline-flex items-center gap-2"
              >
                Détails
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
