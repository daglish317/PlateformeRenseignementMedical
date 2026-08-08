import { DashboardLayout } from "@/features/shared/dashboard/layout/DashboardLayout";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout type="OWNER">{children}</DashboardLayout>;
}
