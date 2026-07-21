"use client";

import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  item: { label: string; href: string; icon: LucideIcon; badge?: number };
  active: boolean;
  collapsed: boolean;
}

export function SidebarMenuItem({ item, active, collapsed }: SidebarMenuItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}
      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
