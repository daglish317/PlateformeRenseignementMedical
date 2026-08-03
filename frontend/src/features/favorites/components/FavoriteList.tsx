"use client";

import { useFavorites } from "../hooks/useFavorites";
import Image from "next/image";
import Link from "next/link";
import { Heart, Hospital, Pill, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemoveFavorite } from "../hooks/useRemoveFavorite";

function FavoriteCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function FavoriteList() {
  const { data, isLoading, error, refetch } = useFavorites();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const favorites = data?.results ?? [];

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FavoriteCardSkeleton />
          <FavoriteCardSkeleton />
          <FavoriteCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold">Impossible de charger vos favoris</h3>
        <p className="text-muted-foreground">
          Une erreur est survenue lors de la récupération de vos favoris.
          Vérifiez votre connexion, puis réessayez.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold">Aucun favori pour le moment</h3>
        <p className="text-muted-foreground">
          Explorez nos structures médicales et enregistrez celles qui vous
          intéressent en touchant le cœur.
        </p>
        <Link href="/">
          <Button>
            Explorer les structures
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {data?.total ?? 0} favori{(data?.total ?? 0) > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => (
          <article key={fav.id} className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {fav.structure.photo ? (
                  <Image src={fav.structure.photo} alt={fav.structure.nom} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/5">
                    {fav.structure.type === "HOPITAL" ? (
                      <Hospital className="h-8 w-8 text-primary" />
                    ) : (
                      <Pill className="h-8 w-8 text-primary" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-1 font-semibold text-foreground">{fav.structure.nom}</h3>
                <span className="text-sm text-primary mt-1">{fav.structure.type}</span>
                <p className="line-clamp-2 text-sm text-muted-foreground mt-2">{fav.structure.adresse}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground">Ajouté le {new Date(fav.date_ajout).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => removeFavorite(fav.structure.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Link href={`/structure/${fav.structure.id}`}>
                  <Button size="sm" className="rounded-xl">Voir</Button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
