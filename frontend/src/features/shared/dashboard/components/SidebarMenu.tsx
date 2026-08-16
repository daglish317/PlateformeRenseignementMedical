"use client";

import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { SidebarMenuItem } from "./SidebarMenuItem";

interface SidebarMenuProps {
  items: Array<{ label: string; href: string; icon: LucideIcon; badge?: number }>;
  collapsed: boolean;
  onNavigate?: () => void;
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarMenuComponent({ items, collapsed, onNavigate }: SidebarMenuProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <SidebarMenuItem
          key={item.href}
          item={item}
          active={isActiveRoute(pathname, item.href)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export const SidebarMenu = memo(SidebarMenuComponent);
