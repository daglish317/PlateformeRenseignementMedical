"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";
import { useDashboardSidebar } from "../hooks/useDashboardSidebar";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { DASHBOARD_SIDEBAR, DASHBOARD_LAYOUT } from "../constants/layout";
import { SidebarMenu } from "../components/SidebarMenu";
import type { DashboardType } from "../types";

interface DashboardSidebarProps {
  type: DashboardType;
  className?: string;
}

export function DashboardSidebar({ type, className }: DashboardSidebarProps) {
  const { open, collapsed, isMobile, setOpen, setIsMobile } = useDashboardSidebar();
  const { navigation } = useDashboardNavigation(type);
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const closeMobileMenu = useCallback(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${DASHBOARD_LAYOUT.mobileBreakpoint - 1}px)`
    );

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

  const subtitles: Record<DashboardType, string> = {
    HOPITAL: "Hôpital",
    PHARMACIE: "Pharmacie",
    OWNER: "Propriétaire",
  };
  const subtitle = subtitles[type];

  const sidebarContent = useMemo(() => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-center border-b px-4">
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

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarMenu
          items={navigation}
          collapsed={collapsed}
          onNavigate={closeMobileMenu}
        />
      </div>

    </div>
  ), [closeMobileMenu, collapsed, isDark, navigation]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>{subtitle} - Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 border-r bg-background transition-all duration-300",
        className
      )}
      style={{
        width: collapsed ? DASHBOARD_SIDEBAR.collapsedWidth : DASHBOARD_SIDEBAR.width,
      }}
    >
      {sidebarContent}
    </aside>
  );
}
