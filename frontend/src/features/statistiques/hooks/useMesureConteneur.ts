"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mesure la largeur d'un conteneur sans déclencher de boucle de rendu.
 * Remplace ResponsiveContainer (recharts) dont le ResizeObserver interne peut
 * provoquer des boucles infinies quand la taille du conteneur est instable.
 * Les dimensions sont lues avec requestAnimationFrame et ignorées si elles
 * n'ont pas réellement changé (seuil de 1px).
 */
export function useMesureConteneur<T extends HTMLElement>(hauteur = 240) {
  const ref = useRef<T | null>(null);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    let raf = 0;
    const appliquer = (mesure: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setLargeur((precedente) =>
          Math.abs(precedente - mesure) > 1 ? Math.round(mesure) : precedente
        );
      });
    };

    const observer = new ResizeObserver((entrees) => {
      const { width } = entrees[0]?.contentRect ?? { width: 0 };
      appliquer(width);
    });

    observer.observe(element);
    appliquer(element.getBoundingClientRect().width);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return { ref, largeur, hauteur };
}
