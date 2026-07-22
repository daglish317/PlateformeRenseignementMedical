"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, MapPin, AlertTriangle, Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getCurrentLocation } from "@/services/map/geolocalisation";
import { gestionnaireService } from "../api/gestionnaire.service";

type AxiosError = { response?: { data?: { detail?: string; message?: string } } };

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function StructureSetupForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then(setCoords)
      .catch(() => setGeoError("La géolocalisation est requise. Veuillez autoriser l'accès à votre position."))
      .finally(() => setGeoLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setPhotoError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
        photo,
      });
      toast.success("Structure soumise avec succès !");
      router.push("/gestionnaire/success");
    } catch (err) {
      const msg = (err as AxiosError).response?.data?.detail || (err as AxiosError).response?.data?.message || "Erreur lors de la soumission.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = !!geoError || geoLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <Label>Photo de la structure</Label>
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25">
            {photoPreview ? (
              <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
          {photoError && <p className="text-sm text-destructive">{photoError}</p>}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={formDisabled || loading}
            >
              <Camera className="mr-1.5 h-4 w-4" />
              {photo ? "Changer" : "Ajouter une photo"}
            </Button>
            {photo && (
              <Button type="button" size="sm" variant="destructive" onClick={handleRemovePhoto} disabled={loading}>
                <X className="mr-1.5 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </div>

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
