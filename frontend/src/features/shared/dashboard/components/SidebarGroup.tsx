"use client";

interface SidebarGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      {title && (
        <div className="flex items-center gap-2 px-3 pb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
