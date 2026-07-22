"use client";

import { Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useNotifications } from "@/providers/notification.provider";

export function HeaderNotifications() {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/admin/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
