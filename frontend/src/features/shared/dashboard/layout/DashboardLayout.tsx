"use client";

import { DashboardRoute } from "./DashboardRoute";
import { DashboardShell } from "./DashboardShell";

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  return (
    <DashboardRoute type={type}>
      <DashboardShell type={type}>{children}</DashboardShell>
    </DashboardRoute>
  );
}
