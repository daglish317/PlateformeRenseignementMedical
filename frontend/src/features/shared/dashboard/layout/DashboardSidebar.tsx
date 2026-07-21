"use client";

import { useEffect } from "react";
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
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
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          SP
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">SantéProx</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
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
