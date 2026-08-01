"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import Sidebar from "./sidebar/Sidebar";
import MedicalMap from "@/components/map/MedicalMap";
import MobileViewNav, { MobileView } from "./mobile/MobileViewNav";

export default function PublicHome() {
  const [view, setView] = useState<MobileView>("recherche");

  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        min-h-0
        overflow-hidden

        md:flex-row
      "
    >
      {/* 
        Vue Recherche (sidebar) :
        - Mobile : plein écran, seul le résultat est visible selon la vue active.
        - Desktop : fixe à gauche.
      */}
      <aside
        className={cn(
          "absolute inset-0 flex flex-col border-b border-border bg-background",
          view === "recherche" ? "visible" : "invisible",
          "md:visible md:static md:h-full md:w-[390px] md:shrink-0 md:border-b-0 md:border-r",
          "xl:w-[420px]"
        )}
      >
        <Sidebar />
      </aside>

      {/* 
        Vue Carte :
        - Mobile : plein écran quand elle est active.
        - Desktop : occupe tout l'espace restant.
      */}
      <section
        className={cn(
          "absolute inset-0 shrink-0 bg-background",
          view === "carte" ? "visible" : "invisible",
          "md:visible md:static md:h-full md:flex-1"
        )}
      >
        <div
          className="
            h-full
            w-full
            overflow-hidden
            bg-background
          "
        >
          <MedicalMap />
        </div>
      </section>

      {/* Navigation flottante (mobile uniquement) */}
      <MobileViewNav
        view={view}
        onViewChange={setView}
      />
    </div>
  );
}
