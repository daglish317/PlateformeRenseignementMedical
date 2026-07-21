"use client";

import { cn } from "@/lib/utils";

interface AdminSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminSection({ children, className }: AdminSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm md:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
