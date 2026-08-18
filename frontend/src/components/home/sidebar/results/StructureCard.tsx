"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Car, Footprints, MapPin, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicPharmacieResult } from "@/types/search";
import { Link } from "@/i18n/navigation";
import { useSearchStore } from "@/store/search-store";
import { useRoute } from "@/features/routing/hooks/useRoute";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";
import { cn } from "@/lib/utils";

type StructureCardProps = {
  result: PublicPharmacieResult;
};

export default function StructureCard({ result }: StructureCardProps) {
  const t = useTranslations("search");
  const { structure, produit, distance_km, temps_marche_min, temps_voiture_min, est_ouverte } = result;
  const setSelectedStructure = useSearchStore((state) => state.setSelectedStructure);
  const selectedStructure = useSearchStore((state) => state.selectedStructure);

  const { calculateRoute, loading: routeLoading } = useRoute();
  const { locateUser } = useCurrentLocation();

  const isSelected = selectedStructure?.id === structure.id;

  const handleRoute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const position = await locateUser();
    if (position && structure.latitude !== null && structure.longitude !== null) {
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
      className={cn(
        "relative flex cursor-pointer gap-2.5 overflow-hidden rounded-xl border bg-card p-2.5 pl-3 transition-all hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      {/* Bandeau couleur pharmacie */}
      <span className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />

      {/* Photo */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {structure.photo ? (
          <Image
            src={structure.photo}
            alt={structure.nom}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-500/10">
            <Pill className="h-6 w-6 text-emerald-500" />
          </div>
        )}
        <div className="absolute bottom-1 left-1">
          <Badge className="border-0 bg-emerald-50 px-1.5 py-0 text-[9px] leading-4 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            Pharmacie
          </Badge>
        </div>
      </div>

      {/* Infos */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground">
            {structure.nom}
          </h3>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <FavoriteButton structureId={structure.id} />
          </div>
        </div>

        {/* Produit + quantité */}
        <p className="line-clamp-1 text-[11px] font-medium text-foreground">
          {produit.nom}
          <span className="ml-2 text-muted-foreground">
            {t("stockAvailable", { quantite: produit.quantite })}
          </span>
        </p>

        {/* Statut ouvert / fermé */}
        <Badge
          className={cn(
            "w-fit border-0 px-2 py-0 text-[10px]",
            est_ouverte
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
          )}
        >
          {est_ouverte ? t("open") : t("closed")}
        </Badge>

        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          {distance_km !== null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {distance_km} km
            </span>
          )}
          {temps_marche_min !== null && (
            <span className="flex items-center gap-1">
              <Footprints className="h-3 w-3" />
              {t("walking", { minutes: temps_marche_min })}
            </span>
          )}
          {temps_voiture_min !== null && (
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              {t("driving", { minutes: temps_voiture_min })}
            </span>
          )}
        </div>

        {structure.adresse && (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {structure.adresse}
          </p>
        )}

        <div className="mt-auto flex gap-1 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 rounded-lg px-2 text-[11px]"
            onClick={handleRoute}
            disabled={routeLoading}
          >
            <MapPin className="mr-1 h-3 w-3" />
            {routeLoading ? "..." : t("route")}
          </Button>
          <Link
            href={`/structure/${structure.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              className="h-6 rounded-lg px-2 text-[11px]"
            >
              {t("details")}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
