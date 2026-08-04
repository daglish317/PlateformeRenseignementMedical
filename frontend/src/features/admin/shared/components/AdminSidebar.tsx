"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";
import { useNotifications } from "@/providers/notification.provider";
import { adminNavigation, isActiveRoute } from "../navigation/navigation";
import { useSidebar } from "../hooks/useSidebar";
import { ADMIN_SIDEBAR } from "../constants/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const SidebarNav = memo(function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { getUnreadCount } = useNotifications();
  const items = useMemo(
    () =>
      adminNavigation.map((item) => ({
        ...item,
        active: isActiveRoute(pathname, item.href),
        badgeCount: item.navItem ? getUnreadCount(item.navItem) : 0,
      })),
    [getUnreadCount, pathname]
  );

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badgeCount > 0 && (
              <span className="ml-auto rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
                {item.badgeCount > 99 ? "99+" : item.badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
});

const SidebarContent = memo(function SidebarContent({
  collapsed,
  isDark,
  onNavigate,
}: {
  collapsed: boolean;
  isDark: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-20 shrink-0 items-center justify-center border-b px-4",
          collapsed ? "justify-center" : ""
        )}
      >
        {collapsed ? (
          <Image
            src={isDark ? "/logos/logo-icon-dark.svg" : "/logos/logo-icon-light.svg"}
            alt="SantéProx"
            width={32}
            height={34}
            className="shrink-0"
          />
        ) : (
          <Image
            src={isDark ? "/logos/logo-vertical-dark.svg" : "/logos/logo-vertical-light.svg"}
            alt="SantéProx"
            width={140}
            height={124}
            className="shrink-0"
          />
        )}
      </div>
      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
    </div>
  );
});

export function AdminSidebar() {
  const { open, collapsed, isMobile, setOpen, setCollapsed, setIsMobile } = useSidebar();
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const closeMobileMenu = useCallback(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncResponsiveState = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      setOpen(!mobile);
    };

    syncResponsiveState();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncResponsiveState);
      return () => mediaQuery.removeEventListener("change", syncResponsiveState);
    }

    mediaQuery.addListener(syncResponsiveState);
    return () => mediaQuery.removeListener(syncResponsiveState);
  }, [setIsMobile, setOpen]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile, setCollapsed]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation administrateur</SheetTitle>
          </SheetHeader>
          <SidebarContent
            collapsed={false}
            isDark={isDark}
            onNavigate={closeMobileMenu}
          />
        </SheetContent>
      </Sheet>
    );
  }

  const width = collapsed ? ADMIN_SIDEBAR.collapsedWidth : ADMIN_SIDEBAR.width;

  return (
    <aside
      className="hidden shrink-0 border-r bg-background transition-[width] duration-200 md:flex md:flex-col"
      style={{ width }}
    >
      <SidebarContent
        collapsed={collapsed}
        isDark={isDark}
        onNavigate={closeMobileMenu}
      />
    </aside>
  );
}
