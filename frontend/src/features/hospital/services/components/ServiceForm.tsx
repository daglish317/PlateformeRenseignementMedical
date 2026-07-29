"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface ServiceFormProps {
  onSubmit: (nom: string) => void;
  isSubmitting: boolean;
}

export function ServiceForm({ onSubmit, isSubmitting }: ServiceFormProps) {
  const [nom, setNom] = useState("");

  const handleSubmit = () => {
    if (!nom.trim()) return;
    onSubmit(nom.trim());
    setNom("");
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Input
          placeholder="Nom du service"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!nom.trim() || isSubmitting}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter
      </Button>
    </div>
  );
}
