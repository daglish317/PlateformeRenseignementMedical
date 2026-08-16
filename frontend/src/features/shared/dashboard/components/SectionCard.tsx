"use client";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function SectionCard({ children, className, title, actions }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border/70 bg-card p-4 shadow-sm ring-1 ring-transparent transition-colors md:p-6",
        className
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <h3 className="truncate text-base font-semibold tracking-tight md:text-lg">
                {title}
              </h3>
            </div>
          )}
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
