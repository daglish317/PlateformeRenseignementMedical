"use client";

import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "../../header/HeaderSearch";
import { HeaderNotifications } from "../../header/HeaderNotifications";
import { HeaderProfile } from "../../header/HeaderProfile";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { useSidebar } from "../hooks/useSidebar";
import { ADMIN_HEADER } from "../constants/header";

export function AdminHeader() {
  const { toggle, collapsed, isMobile } = useSidebar();

  return (
    <header
      className="flex shrink-0 items-center gap-4 border-b bg-background px-4"
      style={{ height: ADMIN_HEADER.height }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isMobile ? "Ouvrir le menu" : collapsed ? "Déplier la sidebar" : "Replier la sidebar"}
      >
        {isMobile ? (
          <Menu className="h-5 w-5" />
        ) : collapsed ? (
          <PanelLeft className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </Button>

      <div className="hidden min-w-0 flex-1 lg:block">
        <AdminBreadcrumb />
      </div>

      <HeaderSearch />

      <div className="flex items-center gap-1">
        <HeaderNotifications />
        <HeaderProfile />
      </div>
    </header>
  );
}
