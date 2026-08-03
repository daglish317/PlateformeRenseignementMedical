"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCheckFavorite } from "../hooks/useCheckFavorite";
import { useAddFavorite } from "../hooks/useAddFavorite";
import { useRemoveFavorite } from "../hooks/useRemoveFavorite";

type FavoriteButtonProps = {
  structureId: string;
};

export default function FavoriteButton({ structureId }: FavoriteButtonProps) {
  const { data, isLoading } = useCheckFavorite(structureId);
  const { mutate: addFavorite, isPending: adding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: removing } = useRemoveFavorite();
  const authenticated = useAuthStore((state) => state.authenticated);
  const router = useRouter();
  const pathname = usePathname();

  const isFavorite = data?.is_favori ?? false;
  const loading = isLoading || adding || removing;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authenticated) {
      router.push(`/connexion?returnTo=${pathname}`);
      return;
    }
    if (isFavorite) {
      removeFavorite(structureId);
    } else {
      addFavorite(structureId);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full ${isFavorite ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  );
}
