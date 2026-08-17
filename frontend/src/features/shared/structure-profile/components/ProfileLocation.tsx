"use client";

import { Loader2, LocateFixed, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentLocation } from "@/hooks/map/useCurrentLocation";

interface ProfileLocationProps {
  latitude: number | string | null;
  longitude: number | string | null;
  isEditing?: boolean;
  onFieldChange?: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

function formatCoordinate(value: number | string | null) {
  if (value === null || value === "") return "";
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(6) : String(value);
}

export function ProfileLocation({
  latitude,
  longitude,
  isEditing = false,
  onFieldChange,
  errors,
}: ProfileLocationProps) {
  const { locateUser, loading } = useCurrentLocation();

  async function handleUseCurrentLocation() {
    if (!onFieldChange) return;
    const position = await locateUser();
    if (!position) return;
    onFieldChange("latitude", position.latitude.toFixed(8));
    onFieldChange("longitude", position.longitude.toFixed(8));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Position GPS
        </Label>

        {isEditing ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-latitude" className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  id="profile-latitude"
                  inputMode="decimal"
                  value={latitude ?? ""}
                  onChange={(event) => onFieldChange?.("latitude", event.target.value)}
                  placeholder="Ex. 3.84803300"
                  disabled={loading}
                />
                {errors?.latitude && (
                  <p className="text-xs text-destructive">{errors.latitude}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-longitude" className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  id="profile-longitude"
                  inputMode="decimal"
                  value={longitude ?? ""}
                  onChange={(event) => onFieldChange?.("longitude", event.target.value)}
                  placeholder="Ex. 11.50207500"
                  disabled={loading}
                />
                {errors?.longitude && (
                  <p className="text-xs text-destructive">{errors.longitude}</p>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
              Utiliser ma position actuelle
            </Button>
          </div>
        ) : latitude != null && longitude != null ? (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Latitude:</span> {formatCoordinate(latitude)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Longitude:</span> {formatCoordinate(longitude)}
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
