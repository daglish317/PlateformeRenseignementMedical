import { DashboardLayout } from "@/features/shared/dashboard/layout/DashboardLayout";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout type="HOPITAL">{children}</DashboardLayout>;
}
