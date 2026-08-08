"use client";
import { useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useStock } from "../hooks/useStock";
import { useDeleteStock } from "../hooks/useDeleteStock";
import { StockItem } from "../types/stock";
import { StockTable } from "../components/StockTable";
import { StockFilters } from "../components/StockFilters";
import { DeleteStockDialog } from "../components/DeleteStockDialog";
import { useMyStructureId } from "@/features/shared/dashboard/hooks/useMyStructureId";

export default function StockPage() {
  const { data: structureId } = useMyStructureId();
  const { data: items, isLoading, error } = useStock(structureId ?? "");
  const deleteMutation = useDeleteStock(structureId ?? "");

  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);
  const [filter, setFilter] = useState("all");

  const filteredItems = (items ?? []).filter((item) => {
    if (filter === "available") return item.disponible && item.quantite > item.seuil_alerte;
    if (filter === "low") return item.disponible && item.quantite <= item.seuil_alerte && item.quantite > 0;
    if (filter === "out") return !item.disponible || item.quantite === 0;
    return true;
  });

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id, {
      onSuccess: () => setDeletingItem(null),
    });
  };

  return (
    <PageContainer>
      <PageTitle
        title="Stock"
        subtitle="Le stock de la pharmacie n'est modifié que par les approvisionnements"
      />

      <SectionCard title="Filtres">
        <StockFilters currentFilter={filter} onFilterChange={setFilter} />
      </SectionCard>

      <SectionCard title="Articles en stock">
        {isLoading && <p className="text-muted-foreground p-4">Chargement...</p>}
        {error && <p className="text-destructive p-4">Erreur de chargement</p>}
        {items && (
          <StockTable
            items={filteredItems}
            onDelete={setDeletingItem}
          />
        )}
      </SectionCard>

      <DeleteStockDialog
        item={deletingItem}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
        isDeleting={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
