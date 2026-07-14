import SidebarHeader from "./SidebarHeader";
import EmergencyGrid from "./emergency/EmergencyGrid";

export default function Sidebar() {
  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-background
      "
    >
      {/* ===========================
          Zone fixe
      ============================ */}
      <div
        className="
          shrink-0
          border-b
          border-border
        "
      >
        <SidebarHeader />

        <EmergencyGrid />
      </div>

      {/* ===========================
          Résultats
      ============================ */}
      <section
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* Titre fixe */}
        <div
          className="
            shrink-0
            border-b
            border-border
            px-6
            py-4
          "
        >
          <h2 className="text-lg font-semibold tracking-tight">
            Résultats de recherche
          </h2>
        </div>

        {/* Liste scrollable */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-6
            py-5
          "
        >
          {/* Les cartes des structures seront affichées ici */}
        </div>
      </section>
    </div>
  );
}