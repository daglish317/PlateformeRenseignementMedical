"use client";

import { Building2 } from "lucide-react";

export default function PharmacyCaissePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Caisse</h1>
          <p className="text-sm text-muted-foreground">
            Gestion de la caisse et des transactions
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Module Caisse - En cours d&apos;implémentation
        </p>
      </div>
    </div>
  );
}
