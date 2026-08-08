"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";
import { DashboardFooter } from "./DashboardFooter";
import type { DashboardType } from "../types";

interface DashboardShellProps {
  children: React.ReactNode;
  type: DashboardType;
}

export function DashboardShell({ children, type }: DashboardShellProps) {
  const isPharmacy = type === "PHARMACIE";
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <DashboardSidebar type={type} className={isPharmacy ? "sidebar-bg" : undefined} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader type={type} className={isPharmacy ? "header-bg" : undefined} />
        <DashboardContent>{children}</DashboardContent>
        <DashboardFooter />
      </div>
    </div>
  );
}
