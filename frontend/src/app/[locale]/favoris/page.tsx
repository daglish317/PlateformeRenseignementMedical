"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import FavoriteList from "@/features/favorites/components/FavoriteList";

export default function FavorisPage() {
  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes favoris</h1>
          <p className="text-muted-foreground">
            Retrouvez ici toutes vos structures médicales enregistrées.
          </p>
        </div>
        
        <FavoriteList />
      </div>
    </PublicLayout>
  );
}
