"use client";

import { Menu, PanelLeftClose, PanelLeft, Bell, LogOut, User } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardSidebar } from "../hooks/useDashboardSidebar";
import { DASHBOARD_HEADER } from "../constants/layout";
import { DashboardBreadcrumb } from "./DashboardBreadcrumb";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useNotifications } from "@/providers/notification.provider";
import type { DashboardType } from "../types";

interface DashboardHeaderProps {
  type: DashboardType;
  className?: string;
}

export function DashboardHeader({ type, className }: DashboardHeaderProps) {
  const { collapsed, isMobile, toggle } = useDashboardSidebar();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const showNotificationsLink = type === "HOPITAL" || type === "PHARMACIE";

  const initials = user
    ? `${user.nom?.charAt(0) ?? ""}${user.email?.charAt(0) ?? ""}`.toUpperCase()
    : "?";

  function handleLogout() {
    clearAuth();
    router.push("/connexion");
  }

  return (
    <header
      className={cn("flex shrink-0 items-center gap-3 border-b bg-background px-4", className)}
      style={{ height: DASHBOARD_HEADER.height }}
    >
      <Button variant="ghost" size="icon" onClick={toggle}>
        {isMobile ? (
          <Menu className="h-5 w-5" />
        ) : collapsed ? (
          <PanelLeft className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </Button>

      <div className="hidden min-w-0 flex-1 md:block">
        <DashboardBreadcrumb />
      </div>

      <div className="flex items-center gap-1">
        {showNotificationsLink && (
          <Link
            href={`/${type.toLowerCase()}/notifications`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Déconnexion"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.nom ?? "Utilisateur"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
