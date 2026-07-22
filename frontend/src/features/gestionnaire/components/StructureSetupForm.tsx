"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getCurrentLocation } from "@/services/map/geolocalisation";
import { gestionnaireService } from "../api/gestionnaire.service";

type AxiosError = { response?: { data?: { detail?: string; message?: string } } };

interface StructureSetupFormProps {
  onComplete: () => void;
}

export function StructureSetupForm({ onComplete }: StructureSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    getCurrentLocation()
      .then(setCoords)
      .catch(() => setGeoError("La géolocalisation est requise. Veuillez autoriser l'accès à votre position."))
      .finally(() => setGeoLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;

    setLoading(true);
    try {
      await gestionnaireService.submitStructure({
        nom,
        type,
        adresse,
        telephone,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      toast.success("Vos informations sont en attente de validation. Une fois traitées, nous vous enverrons un email.");
      onComplete();
    } catch (err) {
      const msg = (err as AxiosError).response?.data?.detail || (err as AxiosError).response?.data?.message || "Erreur lors de la soumission.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = !!geoError || geoLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {geoLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Activation de la géolocalisation...
        </div>
      )}

      {geoError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Géolocalisation requise</p>
            <p>{geoError}</p>
          </div>
        </div>
      )}

      {coords && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Position : {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="nom">Nom de la structure</Label>
        <Input
          id="nom"
          placeholder="Ex : Hôpital Central"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          minLength={3}
          disabled={formDisabled || loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          disabled={formDisabled || loading}
        >
          <option value="" disabled>
            Sélectionnez un type
          </option>
          <option value="HOPITAL">Hôpital</option>
          <option value="PHARMACIE">Pharmacie</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          placeholder="Adresse complète"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          required
          disabled={formDisabled || loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          placeholder="Numéro de téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          required
          minLength={8}
          disabled={formDisabled || loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={formDisabled || loading || !nom || !type || !adresse || !telephone}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Soumission en cours...
          </>
        ) : (
          "Soumettre les informations"
        )}
      </Button>
    </form>
  );
}
