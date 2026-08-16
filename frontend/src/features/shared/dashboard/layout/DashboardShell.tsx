"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";
import { DashboardFooter } from "./DashboardFooter";
import type { DashboardType } from "../types";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  type: DashboardType;
}

export function DashboardShell({ children, type }: DashboardShellProps) {
  return (
    <div
      className={cn(
        "dashboard-shell flex h-screen overflow-hidden bg-background",
        type === "PHARMACIE" && "dashboard-pharmacy",
        type === "HOPITAL" && "dashboard-hospital",
        type === "OWNER" && "dashboard-owner"
      )}
      data-dashboard-type={type}
    >
      <DashboardSidebar type={type} className="sidebar-bg" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader type={type} className="header-bg" />
        <DashboardContent>{children}</DashboardContent>
        <DashboardFooter />
      </div>
    </div>
  );
}
