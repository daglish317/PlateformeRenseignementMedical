"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Calendar } from "lucide-react";
import { useRoute } from "@/features/routing/hooks/useRoute";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";
import { useRouter } from "next/navigation";
import type { StructureDetail } from "../types/structure-detail";
import FavoriteButton from "@/features/favorites/components/FavoriteButton";

export default function StructureActions({ structure }: { structure: StructureDetail }) {
  const { calculateRoute, loading: routeLoading } = useRoute();
  const { locateUser } = useCurrentLocation();
  const router = useRouter();

  const handleRoute = async () => {
    const position = await locateUser();
    if (position) {
      calculateRoute({
        startLat: position.latitude,
        startLng: position.longitude,
        endLat: structure.latitude,
        endLng: structure.longitude,
      });
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col gap-4 sticky top-8">
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Actions rapides</h3>
          <FavoriteButton structureId={structure.id} />
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full rounded-2xl py-6 text-base font-semibold border-2 transition-all hover:bg-muted"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/");
            }}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>

          <Button 
            className="w-full rounded-2xl py-7 text-lg font-semibold shadow-md transition-all hover:scale-[1.02]" 
            onClick={handleRoute} 
            disabled={routeLoading}
          >
            <MapPin className="mr-3 h-6 w-6" />
            {routeLoading ? "Calcul en cours..." : "Voir l'itinéraire"}
          </Button>
          
          {structure.telephone && (
            <Button 
              variant="outline" 
              className="w-full rounded-2xl py-7 text-lg font-semibold border-2 transition-all hover:bg-muted" 
              onClick={() => window.open(`tel:${structure.telephone}`)}
            >
              <Phone className="mr-3 h-6 w-6 text-primary" />
              Appeler le centre
            </Button>
          )}
          
          <Button 
            variant="secondary" 
            className="w-full rounded-2xl py-7 text-lg font-semibold transition-all hover:bg-secondary/80"
          >
            <Calendar className="mr-3 h-6 w-6" />
            Prendre rendez-vous
          </Button>
        </div>
      </div>
    </div>
  );
}
