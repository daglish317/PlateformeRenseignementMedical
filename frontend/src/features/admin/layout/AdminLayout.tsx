"use client";

import { AdminShell } from "./AdminShell";
import { AdminRoute } from "../shared/components/AdminRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRoute>
      <AdminShell>{children}</AdminShell>
    </AdminRoute>
  );
}

export default AdminLayout;
