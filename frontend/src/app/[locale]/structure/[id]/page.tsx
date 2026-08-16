"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("structure");
  const { data: structure, isLoading: loading, error } = useStructureDetail(id);

  if (loading) {
    return (
      <PublicLayout showSearch={false} showFooter={true}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !structure) {
    return (
      <PublicLayout showSearch={false} showFooter={true}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold">{t("notFoundTitle")}</h1>
          <p className="text-muted-foreground">{t("notFoundText")}</p>
        </div>
      </PublicLayout>
    );
  }

  const estPharmacie = structure.type === "PHARMACIE";

  return (
    <PublicLayout showSearch={false} showFooter={true}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <StructureHeader structure={structure} />

        <div className="mb-2 mt-4">
          <StructureBreadcrumb name={structure.nom} />
        </div>

        <StructureNavMobile />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div id="infos" className="scroll-mt-20">
              <StructureInfo structure={structure} />
            </div>
            {!estPharmacie && (
              <>
                <div id="services" className="scroll-mt-20">
                  <StructureServices structure={structure} />
                </div>
                <div id="plateau" className="scroll-mt-20">
                  <PlateauTechnique structure={structure} />
                </div>
              </>
            )}
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

          <div className="space-y-6 lg:col-span-1">
            <StructureActions structure={structure} />
            <div className="sticky top-8 hidden lg:block">
              <StructureNavDesktop />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
