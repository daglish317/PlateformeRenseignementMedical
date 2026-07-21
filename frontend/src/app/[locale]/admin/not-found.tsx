import { AdminEmptyState } from "@/features/admin/shared/components/AdminEmptyState";
import { AdminPageTitle } from "@/features/admin/shared/components/AdminPageTitle";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function AdminNotFoundPage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle title="Page introuvable" />
      <AdminEmptyState
        title="Cette page n'existe pas"
        description="La page que vous recherchez n'est pas disponible dans le dashboard administrateur."
      />
      <div className="flex justify-center">
        <Button render={<Link href="/admin" />}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
