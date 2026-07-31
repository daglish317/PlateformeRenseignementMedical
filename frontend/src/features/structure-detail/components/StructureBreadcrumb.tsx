import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

type StructureBreadcrumbProps = {
  name: string;
};

export default function StructureBreadcrumb({ name }: StructureBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        Accueil
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="truncate text-foreground font-medium max-w-[300px]">
        {name}
      </span>
    </nav>
  );
}
