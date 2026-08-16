"use client";

import { useState } from "react";
import { Loader2, Pill, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useStructureProduits } from "../hooks/useStructureProduits";
import type { StructureDetail } from "../types/structure-detail";

type StructureMedicamentsProps = {
  structure: StructureDetail;
};

export default function StructureMedicaments({ structure }: StructureMedicamentsProps) {
  const t = useTranslations("structure");
  const estPharmacie = structure.type === "PHARMACIE";

  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const rechercheDebounce = useDebounce(recherche, 300);

  const { data, isLoading } = useStructureProduits(
    structure.id,
    rechercheDebounce,
    page,
    estPharmacie
  );

  if (!estPharmacie) return null;

  const produits = data?.results ?? [];
  const hasNext = data?.has_next ?? false;
  const hasRecherche = rechercheDebounce.trim().length > 0;

  return (
    <section className="bg-card rounded-3xl p-8 shadow-sm border border-border mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Pill className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t("productsTitle")}</h2>
      </div>

      {/* Recherche interne limitée à cette pharmacie (§29) */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setPage(1);
          }}
          placeholder={t("productsSearchPlaceholder")}
          className="h-12 rounded-2xl border-border pl-12 pr-4 text-base shadow-sm"
        />
      </div>

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : produits.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produits.map((produit) => (
              <li
                key={produit.id}
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-muted/50"
              >
                <span className="font-medium">{produit.nom}</span>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {t("stockAvailable", { quantite: produit.quantite })}
                </span>
              </li>
            ))}
          </ul>

          {hasNext && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </>
      ) : hasRecherche ? (
        <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-2xl">
          {t("productsSearchEmpty")}
        </p>
      ) : (
        <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-2xl">
          {t("productsUnavailable")}
        </p>
      )}
    </section>
  );
}
