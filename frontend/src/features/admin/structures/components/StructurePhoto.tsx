"use client";

import { Building2 } from "lucide-react";

interface StructurePhotoProps {
  photo: string | null;
  nom: string;
  className?: string;
}

export function StructurePhoto({ photo, nom, className }: StructurePhotoProps) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className={className || "h-10 w-10 rounded-lg object-cover"}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-muted ${className || "h-10 w-10"}`}
    >
      <Building2 className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
