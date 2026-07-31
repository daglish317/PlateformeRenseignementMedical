"use client";

import Sidebar from "./sidebar/Sidebar";
import MedicalMap from "@/components/map/MedicalMap";

export default function PublicHome() {
  return (
    <div
      className="
        flex
        min-h-0
        w-full
        flex-col
        overflow-visible

        md:h-full
        md:flex-row
        md:overflow-hidden
      "
    >
      {/* 
        Desktop :
        - résultats fixes à gauche
        - carte à droite

        Mobile :
        - la sidebar apparaît en premier
        - la carte vient ensuite naturellement
      */}
      <aside
        className="
          order-1
          w-full
          border-b
          border-border
          bg-background

          md:flex
          md:h-full
          md:w-[390px]
          md:shrink-0
          md:flex-col
          md:border-b-0
          md:border-r

          xl:w-[420px]
        "
      >
        <Sidebar />
      </aside>


      {/* 
        Carte :

        Desktop :
        prend tout l'espace restant.

        Mobile :
        hauteur contrôlée.
        Elle ne prend jamais tout l'écran.
      */}
      <section
        className="
          order-2
          h-[420px]
          w-full
          shrink-0
          bg-muted/10
          
          md:h-full
          md:flex-1
          md:p-4
          xl:p-5
        "
      >
        <div
          className="
            h-full
            w-full
            overflow-hidden
            bg-background

            md:rounded-3xl
            md:border
            md:border-border
            md:shadow-sm
          "
        >
          <MedicalMap />
        </div>
      </section>
    </div>
  );
}