"use client";

import { DashboardRoute } from "./DashboardRoute";
import { DashboardShell } from "./DashboardShell";
import type { DashboardType } from "../types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  type: DashboardType;
}

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  return (
    <DashboardRoute type={type}>
      <DashboardShell type={type}>{children}</DashboardShell>
    </DashboardRoute>
  );
}
