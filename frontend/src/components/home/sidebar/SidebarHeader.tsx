import { Search } from "lucide-react";

export default function SidebarHeader() {
  return (
    <header
      className="
        border-b
        border-border
        bg-background
        px-6
        py-4
      "
    >
      <div className="flex items-center gap-4">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >
          <Search className="h-5 w-5" />
        </div>

        <div className="min-w-0">

          <h2
            className="
              text-base
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Recherche médicale
          </h2>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            Trouvez rapidement un établissement ou lancez une recherche d'urgence.
          </p>

        </div>

      </div>
    </header>
  );
}