"use client";

import { use } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useStructureDetail } from "@/features/structure-detail/hooks/useStructureDetail";
import StructureHeader from "@/features/structure-detail/components/StructureHeader";
import StructureInfo from "@/features/structure-detail/components/StructureInfo";
import StructureActions from "@/features/structure-detail/components/StructureActions";
import { StructureNavDesktop, StructureNavMobile } from "@/features/structure-detail/components/StructureNav";
import StructureBreadcrumb from "@/features/structure-detail/components/StructureBreadcrumb";
import StructureServices from "@/features/structure-detail/components/StructureServices";
import StructureMedicaments from "@/features/structure-detail/components/StructureMedicaments";
import PlateauTechnique from "@/features/structure-detail/components/PlateauTechnique";
import StructureHours from "@/features/structure-detail/components/StructureHours";
import StructureContact from "@/features/structure-detail/components/StructureContact";
import { Loader2 } from "lucide-react";

type StructurePageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default function StructurePage({ params }: StructurePageProps) {
  const { id } = use(params);
  const { data: structure, isLoading: loading, error } = useStructureDetail(id);

  if (loading) {
    return (
      <PublicLayout showSearch={false} showFooter={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !structure) {
    return (
      <PublicLayout showSearch={false} showFooter={true}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Structure introuvable</h1>
          <p className="text-muted-foreground">
            La structure médicale que vous recherchez n'existe pas ou une erreur est survenue.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <StructureHeader structure={structure} />

        <div className="mt-4 mb-2">
          <StructureBreadcrumb name={structure.nom} />
        </div>

        <StructureNavMobile />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div id="infos" className="scroll-mt-20">
              <StructureInfo structure={structure} />
            </div>
            <div id="services" className="scroll-mt-20">
              <StructureServices structure={structure} />
            </div>
            <div id="plateau" className="scroll-mt-20">
              <PlateauTechnique structure={structure} />
            </div>
            <div id="medicaments" className="scroll-mt-20">
              <StructureMedicaments structure={structure} />
            </div>
            <div id="horaires" className="scroll-mt-20">
              <StructureHours structure={structure} />
            </div>
            <div id="contact" className="scroll-mt-20">
              <StructureContact structure={structure} />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <StructureActions structure={structure} />
            <div className="hidden lg:block sticky top-8">
              <StructureNavDesktop />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
