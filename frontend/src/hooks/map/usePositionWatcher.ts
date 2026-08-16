"use client";

import { useEffect, useRef } from "react";

import {
  watchPosition,
  type UserLocation,
} from "@/services/map/geolocalisation";
import { useSearchStore } from "@/store/search-store";

const SEUIL_DEPLACEMENT_M = 800;
const COOLDOWN_MS = 20_000;

function distanceMetres(a: UserLocation, b: UserLocation): number {
  const R = 6371000;
  const toRad = (degres: number) => (degres * Math.PI) / 180;
  const dlat = toRad(b.latitude - a.latitude);
  const dlon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dlon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Surveillance contrôlée de la position de l'utilisateur (spec §21-26).
 *
 * La position n'est mise à jour que lorsqu'un déplacement significatif est
 * détecté (au-delà d'un seuil) et jamais plus souvent que l'intervalle de
 * repos. Cela évite de déclencher une recherche complète à chaque variation
 * minime du GPS (limitation des requêtes, de la batterie et de la charge
 * serveur).
 */
export function usePositionWatcher(enabled = true) {
  const setLocation = useSearchStore((state) => state.setLocation);
  const derniereAcceptee = useRef<UserLocation | null>(null);
  const derniereMaj = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    derniereAcceptee.current = useSearchStore.getState().location;

    const stop = watchPosition((location) => {
      const maintenant = Date.now();
      const precedente = derniereAcceptee.current;

      if (
        precedente &&
        (maintenant - derniereMaj.current < COOLDOWN_MS ||
          distanceMetres(precedente, location) < SEUIL_DEPLACEMENT_M)
      ) {
        return;
      }

      derniereAcceptee.current = location;
      derniereMaj.current = maintenant;
      setLocation(location);
    });

    return stop;
  }, [enabled, setLocation]);
}
