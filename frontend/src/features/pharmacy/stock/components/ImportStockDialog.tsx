"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useImportStock } from "../hooks/useImportStock";

interface ImportStockDialogProps {
  structureId: string;
}

export function ImportStockDialog({ structureId }: ImportStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useImportStock(structureId);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
        return;
      }
      setFile(selected);
    }
  }

  function handleImport() {
    if (!file) return;
    mutate(file, {
      onSuccess: () => {
        setOpen(false);
        setFile(null);
      },
    });
  }

  function handleCancel() {
    setOpen(false);
    setFile(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer du stock</DialogTitle>
          <DialogDescription>
            Importez un fichier CSV ou Excel (.xlsx) avec les colonnes : nom, type_item, quantite, seuil_alerte, disponible
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fichier</Label>
            <div
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) setFile(droppedFile);
              }}
            >
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              {file ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Glissez un fichier ici ou{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => inputRef.current?.click()}
                  >
                    parcourez
                  </button>
                </p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Format attendu :</p>
            <p>nom, type_item (MEDICAMENT/EQUIPEMENT/CONSOMMABLE), quantite, seuil_alerte, disponible (true/false)</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={!file || isPending}>
            {isPending ? "Importation..." : "Importer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
