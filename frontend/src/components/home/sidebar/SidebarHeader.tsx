import { Search, Sparkles } from "lucide-react";

export default function SidebarHeader() {
  return (
    <header className="border-b border-border/60 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <Search className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                Recherche médicale
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" />
                Smart
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Recherchez un médicament, une maladie ou une structure médicale.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}