"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home",   icon: LayoutDashboard },
  { href: "/groups",    label: "Groups", icon: Users },
  { href: "/personal",  label: "Ledger", icon: NotebookPen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md">
      <div className="flex">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/groups"
              ? pathname.startsWith("/groups")
              : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative"
            >
              {/* Active gradient pill background */}
              <div className={cn(
                "flex items-center justify-center h-8 w-12 rounded-xl transition-all duration-300",
                active
                  ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 shadow-md shadow-fuchsia-500/30 scale-105"
                  : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  active ? "text-white" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-colors duration-200",
                active ? "text-fuchsia-500" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
