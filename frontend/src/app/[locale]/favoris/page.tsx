"use client";

import PublicLayout from "@/components/layout/PublicLayout";
import FavoriteList from "@/features/favorites/components/FavoriteList";
import { FavoritesAuthPrompt } from "@/features/favorites/components/FavoritesAuthPrompt";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function FavorisPage() {
  const authenticated = useAuthStore((s) => s.authenticated);

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes favoris</h1>
          <p className="text-muted-foreground">
            Retrouvez ici toutes vos structures médicales enregistrées.
          </p>
        </div>

        {authenticated ? <FavoriteList /> : <FavoritesAuthPrompt />}
      </div>
    </PublicLayout>
  );
}
