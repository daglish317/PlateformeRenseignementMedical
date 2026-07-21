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
    <section className={cn("rounded-xl border bg-card p-4 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
