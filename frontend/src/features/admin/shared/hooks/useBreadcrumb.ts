"use client";

import { useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { adminNavigation } from "../navigation/navigation";
import type { BreadcrumbItem } from "../types/navigation";

export function useBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/admin" }];

    const matched = adminNavigation.find((item) => {
      if (item.href === "/admin") return pathname === "/admin";
      return pathname === item.href || pathname.startsWith(item.href + "/");
    });

    if (matched && matched.href !== "/admin") {
      items.push({ label: matched.label, href: matched.href });
    }

    return items;
  }, [pathname]);
}
