"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "infos", label: "Informations" },
  { id: "services", label: "Services" },
  { id: "plateau", label: "Plateau technique" },
  { id: "medicaments", label: "Médicaments" },
  { id: "horaires", label: "Horaires" },
  { id: "contact", label: "Contact" },
];

function useActiveSection() {
  const [activeId, setActiveId] = useState("infos");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return activeId;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function StructureNavDesktop() {
  const activeId = useActiveSection();

  return (
    <nav className="space-y-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sur cette page
      </h4>
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => { e.preventDefault(); scrollTo(id); }}
          className={cn(
            "block rounded-lg px-2 py-1.5 text-sm transition-colors",
            activeId === id
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export function StructureNavMobile() {
  const activeId = useActiveSection();

  return (
    <nav className="sticky top-0 z-20 overflow-x-auto border-b border-border bg-background/95 backdrop-blur lg:hidden">
      <div className="flex gap-1 px-4 py-2">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => { e.preventDefault(); scrollTo(id); }}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              activeId === id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
