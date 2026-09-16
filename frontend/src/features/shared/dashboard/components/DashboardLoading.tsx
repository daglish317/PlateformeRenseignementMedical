import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardLoadingProps {
  className?: string;
}

export function DashboardLoading({ className }: DashboardLoadingProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1500px] px-0 py-1 md:py-2", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/70 bg-card p-4 shadow-sm md:p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-4 h-9 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="mt-3 h-6 w-5/6" />
        <Skeleton className="mt-3 h-6 w-2/3" />
      </div>
    </div>
  );
}