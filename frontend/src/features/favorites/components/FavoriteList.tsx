"use client";

import { useFavorites } from "../hooks/useFavorites";
import Image from "next/image";
import Link from "next/link";
import { Hospital, Pill, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveFavorite } from "../hooks/useRemoveFavorite";

export default function FavoriteList() {
  const { data, isLoading, error } = useFavorites();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const favorites = data?.results ?? [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Chargement des favoris...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Erreur lors du chargement des favoris.</div>;
  if (favorites.length === 0) return <div className="p-8 text-center text-muted-foreground">Aucun favori pour le moment.</div>;

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
