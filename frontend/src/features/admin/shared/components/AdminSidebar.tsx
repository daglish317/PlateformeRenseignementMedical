"use client";

import { useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { adminNavigation, isActiveRoute } from "../navigation/navigation";
import { useSidebar } from "../hooks/useSidebar";
import { ADMIN_SIDEBAR } from "../constants/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {adminNavigation.map((item) => {
        const active = isActiveRoute(pathname, item.href, "");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b px-4",
          collapsed ? "justify-center" : "gap-2"
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          SP
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">SantéProx</p>
            <p className="truncate text-xs text-muted-foreground">Administration</p>
          </div>
        )}
      </div>
      <SidebarNav collapsed={collapsed} />
    </div>
  );
}

export function AdminSidebar() {
  const { open, collapsed, isMobile, setOpen, setCollapsed, setIsMobile } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          <SidebarContent collapsed={false} />
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
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}
