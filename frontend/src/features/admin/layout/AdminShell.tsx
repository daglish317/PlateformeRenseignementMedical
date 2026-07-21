"use client";

import { AdminSidebar } from "../shared/components/AdminSidebar";
import { AdminHeader } from "../shared/components/AdminHeader";
import { AdminContent } from "../shared/components/AdminContent";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <AdminContent>{children}</AdminContent>
      </div>
    </div>
  );
}
