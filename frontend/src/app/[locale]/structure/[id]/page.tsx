"use client";

import { use } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useStructureDetail } from "@/features/structure-detail/hooks/useStructureDetail";
import StructureHeader from "@/features/structure-detail/components/StructureHeader";
import StructureInfo from "@/features/structure-detail/components/StructureInfo";
import StructureActions from "@/features/structure-detail/components/StructureActions";
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <StructureInfo structure={structure} />
            <StructureServices structure={structure} />
            <PlateauTechnique structure={structure} />
            <StructureMedicaments structure={structure} />
            <StructureHours structure={structure} />
            <StructureContact structure={structure} />
          </div>
          
          <div className="lg:col-span-1">
            <StructureActions structure={structure} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
