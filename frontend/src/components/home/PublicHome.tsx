import Sidebar from "./sidebar/Sidebar";

import MedicalMap from "@/components/map/MedicalMap";

export default function PublicHome() {
  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Sidebar */}
      <aside
        className="
          w-[390px]
          xl:w-[420px]
          shrink-0
          border-r
          border-border
          bg-background
        "
      >
        <Sidebar />
      </aside>

      {/* Carte */}
      <section
        className="
          flex-1
          bg-muted/15
          p-4
          lg:p-5
        "
      >
        <div
          className="
            relative
            h-full
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-background
            shadow-sm
          "
        >
          <MedicalMap />
        </div>
      </section>
    </div>
  );
}