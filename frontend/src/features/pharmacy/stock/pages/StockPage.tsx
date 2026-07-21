"use client";
import { useState } from "react";
import { PageTitle } from "@/features/shared/dashboard/components/PageTitle";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";
import { useStock } from "../hooks/useStock";
import { useCreateStock } from "../hooks/useCreateStock";
import { useDeleteStock } from "../hooks/useDeleteStock";
import { StockItem, CreateStockPayload } from "../types/stock";
import { StockTable } from "../components/StockTable";
import { StockForm } from "../components/StockForm";
import { StockFilters } from "../components/StockFilters";
import { DeleteStockDialog } from "../components/DeleteStockDialog";

const STRUCTURE_ID = "placeholder-structure-id";

export default function StockPage() {
  const { data: items, isLoading, error } = useStock(STRUCTURE_ID);
  const createMutation = useCreateStock(STRUCTURE_ID);
  const deleteMutation = useDeleteStock(STRUCTURE_ID);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);
  const [filter, setFilter] = useState("all");

  const filteredItems = (items ?? []).filter((item) => {
    if (filter === "available") return item.disponible && item.quantite > item.seuil_alerte;
    if (filter === "low") return item.disponible && item.quantite <= item.seuil_alerte && item.quantite > 0;
    if (filter === "out") return !item.disponible || item.quantite === 0;
    return true;
  });

  const handleSubmit = (payload: CreateStockPayload) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setShowForm(false);
        setEditingItem(null);
      },
    });
  };

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
        subtitle="Gérer le stock de la structure"
        actions={
          <button
            onClick={() => { setShowForm(true); setEditingItem(null); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Ajouter
          </button>
        }
      />

      <SectionCard title="Filtres">
        <StockFilters currentFilter={filter} onFilterChange={setFilter} />
      </SectionCard>

      {(showForm || editingItem) && (
        <SectionCard title={editingItem ? "Modifier l'article" : "Ajouter un article"}>
          <StockForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            isSubmitting={createMutation.isPending}
          />
        </SectionCard>
      )}

      <SectionCard title="Articles en stock">
        {isLoading && <p className="text-muted-foreground p-4">Chargement...</p>}
        {error && <p className="text-destructive p-4">Erreur de chargement</p>}
        {items && (
          <StockTable
            items={filteredItems}
            onEdit={(item) => { setEditingItem(item); setShowForm(false); }}
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
