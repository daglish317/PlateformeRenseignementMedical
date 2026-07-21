"use client";

interface SidebarGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      {title && (
        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
