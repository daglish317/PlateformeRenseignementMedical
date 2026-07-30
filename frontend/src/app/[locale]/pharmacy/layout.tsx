import { DashboardLayout } from "@/features/shared/dashboard/layout/DashboardLayout";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-pharmacy">
      <DashboardLayout type="PHARMACIE">{children}</DashboardLayout>
    </div>
  );
}
