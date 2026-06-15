"use client";

import Link from "next/link";
import { LogOut, User, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="shrink-0 z-50 border-b bg-card flex h-14 items-center">
      {/* Sidebar-width brand area (desktop) */}
      <div className="hidden md:flex items-center gap-2.5 w-60 shrink-0 px-5 border-r h-full">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent tracking-tight">
            Treatz
          </span>
        </Link>
      </div>

      {/* Right content */}
      <div className="flex flex-1 items-center justify-between px-5">
        {/* Mobile logo */}
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
            Treatz
          </span>
        </Link>
        <div className="hidden md:block" />

        {/* Controls */}
        <div className="flex items-center gap-2">
          {currentUser && <NotificationBell />}
          <ThemeToggle />

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-2.5">
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden",
                    "bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white"
                  )}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{currentUser.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.username ? `@${currentUser.username}` : ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
