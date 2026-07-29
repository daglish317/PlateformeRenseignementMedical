"use client";

import { AdminPageTitle } from "../../shared/components/AdminPageTitle";
import { CreateServiceDialog } from "../components/CreateServiceDialog";
import { ServiceFilters } from "../components/ServiceFilters";
import { ServiceTable } from "../components/ServiceTable";

export function ServicesPage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Services médicaux"
        subtitle="Gestion des services médicaux"
        actions={<CreateServiceDialog />}
      />

      <ServiceFilters />

      <div className="rounded-lg border">
        <ServiceTable />
      </div>
    </div>
  );
}
