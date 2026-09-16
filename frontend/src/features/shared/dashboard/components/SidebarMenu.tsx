"use client";

import { memo, useMemo } from "react";
import type { LucideIcon } from "lucide-react";

import { usePathname } from "@/i18n/navigation";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";

interface SidebarMenuProps {
  items: Array<{ label: string; href: string; icon: LucideIcon; badge?: number }>;
  collapsed: boolean;
  onNavigate?: () => void;
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/hospital" || href === "/pharmacy" || href === "/owner") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getGroupLabel(item: { label: string; href: string }): string {
  if (
    item.href === "/owner" ||
    item.href === "/pharmacy" ||
    item.href === "/hospital" ||
    item.href.includes("/team")
  ) {
    return "Principal";
  }

  if (
    item.href.includes("/stock") ||
    item.href.includes("/medications") ||
    item.href.includes("/supply") ||
    item.href.includes("/inventory") ||
    item.href.includes("/inventaires") ||
    item.href.includes("/peremption")
  ) {
    return "Stock";
  }

  if (
    item.href.includes("/sale") ||
    item.href.includes("/caisse") ||
    item.href.includes("/factures")
  ) {
    return "Vente";
  }

  if (
    item.href.includes("/services") ||
    item.href.includes("/analyses") ||
    item.href.includes("/technical-platforms") ||
    item.href.includes("/care-services") ||
    item.href.includes("/services-medicaux") ||
    item.href.includes("/plateaux-techniques") ||
    item.href.includes("/prises-en-charge")
  ) {
    return "Offre de soins";
  }

  if (
    item.href.includes("/history") ||
    item.href.includes("/alertes") ||
    item.href.includes("/statistics") ||
    item.href.includes("/notifications") ||
    item.href.includes("/schedules")
  ) {
    return "Pilotage";
  }

  return "Compte";
}

function useGroupedItems(items: SidebarMenuProps["items"]) {
  return useMemo(() => {
    const order: string[] = [];
    const byLabel = new Map<string, SidebarMenuProps["items"]>();

    for (const item of items) {
      const label = getGroupLabel(item);
      const group = byLabel.get(label);

      if (!group) {
        order.push(label);
        byLabel.set(label, [item]);
      } else {
        group.push(item);
      }
    }

    return order.map((label) => ({ label, items: byLabel.get(label)! }));
  }, [items]);
}

function SidebarMenuComponent({ items, collapsed, onNavigate }: SidebarMenuProps) {
  const pathname = usePathname();
  const groupedItems = useGroupedItems(items);

  return (
    <nav className="flex flex-col gap-5">
      {groupedItems.map((group) => (
        <SidebarGroup key={group.label} title={collapsed ? undefined : group.label}>
          {group.items.map((item) => (
            <SidebarMenuItem
              key={item.href}
              item={item}
              active={isActiveRoute(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarGroup>
      ))}
    </nav>
  );
}

export const SidebarMenu = memo(SidebarMenuComponent);
