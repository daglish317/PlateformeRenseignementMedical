"use client";

import { AdminPageTitle } from "@/features/admin/shared/components/AdminPageTitle";
import { AdminSection } from "@/features/admin/shared/components/AdminSection";
import { Construction } from "lucide-react";

interface AdminPlaceholderPageProps {
  title: string;
  subtitle?: string;
}

export function AdminPlaceholderPage({ title, subtitle }: AdminPlaceholderPageProps) {
  return (
    <div>
      <AdminPageTitle title={title} subtitle={subtitle} />
      <AdminSection>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Construction className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium">Module en cours de développement</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Cette section sera disponible dans une prochaine mise à jour.
          </p>
        </div>
      </AdminSection>
    </div>
  );
}
