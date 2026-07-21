"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";
import { DashboardFooter } from "./DashboardFooter";

interface DashboardShellProps {
  children: React.ReactNode;
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardShell({ children, type }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <DashboardSidebar type={type} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader type={type} />
        <DashboardContent>{children}</DashboardContent>
        <DashboardFooter />
      </div>
    </div>
  );
}
