import { DashboardLayout } from "@/features/shared/dashboard/layout/DashboardLayout";

export default function CaissierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout type="CAISSIER">{children}</DashboardLayout>;
}
