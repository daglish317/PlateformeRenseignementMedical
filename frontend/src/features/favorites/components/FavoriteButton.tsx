"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const isFavorite = data?.isFavorite ?? false;
  const loading = isLoading || adding || removing;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
