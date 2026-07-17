"use client";

import Sidebar from "./sidebar/Sidebar";
import MedicalMap from "@/components/map/MedicalMap";

export default function PublicHome() {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 w-full">
      {/* Sidebar résultats */}
      <aside className="w-full h-1/2 lg:h-full lg:w-[390px] xl:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-background flex flex-col">
        <Sidebar />
      </aside>

      {/* Carte */}
      <section className="flex-1 h-1/2 lg:h-full bg-muted/15 p-0 lg:p-4 xl:p-5">
        <div className="relative h-full overflow-hidden lg:rounded-3xl border-0 lg:border border-border bg-background shadow-sm">
          <MedicalMap />
        </div>
      </section>
    </div>
  );
}