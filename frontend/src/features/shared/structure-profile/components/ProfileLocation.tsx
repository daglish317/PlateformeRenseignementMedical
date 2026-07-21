"use client";

import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ProfileLocationProps {
  latitude: number | null;
  longitude: number | null;
}

export function ProfileLocation({ latitude, longitude }: ProfileLocationProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Position GPS
        </Label>
        {latitude !== null && longitude !== null ? (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Latitude:</span> {latitude.toFixed(6)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Longitude:</span> {longitude.toFixed(6)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune position GPS enregistrée
          </p>
        )}
      </div>
    </div>
  );
}
