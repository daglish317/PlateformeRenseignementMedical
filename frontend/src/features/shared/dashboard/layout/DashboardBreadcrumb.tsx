"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { hospitalNavigation } from "../navigation/hospital-navigation";
import { pharmacyNavigation } from "../navigation/pharmacy-navigation";

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  const navigation = pathname.startsWith("/hospital")
    ? hospitalNavigation
    : pharmacyNavigation;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Dashboard" },
  ];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const navItem = navigation.find((item) => item.href === currentPath);
    if (navItem) {
      crumbs.push({ label: navItem.label, href: navItem.href });
    } else if (currentPath !== `/${segments[0]}`) {
      crumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1) });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        if (isLast) {
          return (
            <span key={crumb.label} className="font-medium text-foreground">
              {crumb.label}
            </span>
          );
        }

        return (
          <span key={crumb.label} className="flex items-center gap-1">
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        );
      })}
    </nav>
  );
}
