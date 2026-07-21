"use client";

import { cn } from "@/lib/utils";

interface AdminContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminContent({ children, className }: AdminContentProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6",
        className
      )}
    >
      {children}
    </main>
  );
}
