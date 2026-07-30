"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useDashboardSidebar } from "../hooks/useDashboardSidebar";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { DASHBOARD_SIDEBAR, DASHBOARD_LAYOUT } from "../constants/layout";
import { SidebarMenu } from "../components/SidebarMenu";

interface DashboardSidebarProps {
  type: "HOPITAL" | "PHARMACIE";
}

export function DashboardSidebar({ type }: DashboardSidebarProps) {
  const { open, collapsed, isMobile, setOpen, setCollapsed, setIsMobile } =
    useDashboardSidebar();
  const { navigation } = useDashboardNavigation(type);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < DASHBOARD_LAYOUT.mobileBreakpoint;
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile, setOpen]);

  const subtitle = type === "HOPITAL" ? "Hôpital" : "Pharmacie";

  const sidebarContent = (
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
        <SidebarMenu items={navigation} collapsed={collapsed} />
      </div>

      {!isMobile && (
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="ml-2">Réduire</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

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
        "relative flex h-full shrink-0 border-r bg-background transition-all duration-300"
      )}
      style={{
        width: collapsed ? DASHBOARD_SIDEBAR.collapsedWidth : DASHBOARD_SIDEBAR.width,
      }}
    >
      {sidebarContent}
    </aside>
  );
}
