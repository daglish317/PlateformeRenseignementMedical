import type { ReactNode } from "react";

import PublicLayout from "@/components/layout/PublicLayout";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}