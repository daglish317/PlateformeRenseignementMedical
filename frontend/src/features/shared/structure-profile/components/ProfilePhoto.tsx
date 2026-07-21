"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfilePhotoProps {
  photo: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhoto({ photo, onUpload, onDelete }: ProfilePhotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    onUpload(file);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayPhoto = preview || photo;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25">
        {displayPhoto ? (
          <img src={displayPhoto} alt="Photo de la structure" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Camera className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <>
            <Button size="sm" onClick={handleUpload}>
              <Upload className="mr-1.5 h-4 w-4" />
              Confirmer
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelPreview}>
              Annuler
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-1.5 h-4 w-4" />
              {photo ? "Changer" : "Ajouter"}
            </Button>
            {photo && (
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
