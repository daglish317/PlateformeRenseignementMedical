"use client";
import { useState, useRef } from "react";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useImportAnalysis } from "../hooks/useImportAnalysis";

interface ImportAnalysisDialogProps {
  structureId: string;
}

export function ImportAnalysisDialog({ structureId }: ImportAnalysisDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportAnalysis(structureId);

  const handleSubmit = () => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: () => {
        setFile(null);
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          Importer Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer des analyses</DialogTitle>
          <DialogDescription>
            Fichier Excel (.xlsx) ou CSV avec une colonne <strong>Nom de l'analyse</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm text-muted-foreground hover:border-primary"
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <span className="font-medium text-foreground">{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} Ko</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span>Cliquez pour sélectionner un fichier</span>
                <span className="text-xs">.xlsx, .xls ou .csv</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={importMutation.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!file || importMutation.isPending}>
            {importMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
