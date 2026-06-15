"use client";

import { useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyNotifications, useMarkNotificationRead, useMarkAllRead, useUnreadCount } from "@/hooks/useActivity";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  group?: { id: string; name: string } | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications } = useMyNotifications();
  const { count } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const { markAllRead, loading: markingAll } = useMarkAllRead();

  const handleNotifClick = (id: string) => {
    markRead(id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-glow-pulse">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5">
          <div>
            <p className="font-semibold text-sm">Notifications</p>
            {count > 0 && (
              <p className="text-xs text-muted-foreground">{count} unread</p>
            )}
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-fuchsia-600 hover:text-fuchsia-700"
              onClick={() => markAllRead()}
              disabled={markingAll}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            notifications.slice(0, 15).map((n: Notification) => (
              <div
                key={n.id}
                onClick={() => handleNotifClick(n.id)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 border-b last:border-0 cursor-pointer",
                  "transition-colors duration-150 hover:bg-muted/50",
                  !n.read && "bg-fuchsia-500/5"
                )}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full shrink-0 mt-1.5",
                  n.read ? "bg-transparent" : "bg-fuchsia-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {n.group && (
                      <Link
                        href={`/groups/${n.group.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-fuchsia-500 hover:text-fuchsia-600 flex items-center gap-0.5"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        {n.group.name}
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
