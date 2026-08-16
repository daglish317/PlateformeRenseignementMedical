"use client";

import { cn } from "@/lib/utils";

interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <main className={cn("dashboard-content flex-1 overflow-y-auto p-4 md:p-6", className)}>
      {children}
    </main>
  );
}
