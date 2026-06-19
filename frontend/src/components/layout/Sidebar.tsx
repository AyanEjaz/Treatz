"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Users, Receipt, Gift,
  NotebookPen, Banknote, ChevronLeft, Activity, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/personal", label: "My Ledger", icon: NotebookPen },
];

const GROUP_TABS = (groupId: string) => [
  { tab: "treats", label: "Treats", icon: Gift },
  { tab: "expenses", label: "Bill Split", icon: Receipt },
  { tab: "loans", label: "Udhar", icon: Banknote },
  { tab: "activity", label: "Activity", icon: Activity },
  { tab: "analytics", label: "Analytics", icon: BarChart2 },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  delay = 0,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  delay?: number;
}) {
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        "transition-all duration-200 ease-out animate-slide-in-left",
        active
          ? [
              "bg-gradient-to-r from-fuchsia-500 to-rose-500",
              "text-white shadow-lg glow-sm",
              "scale-[1.02]",
            ].join(" ")
          : [
              "text-muted-foreground",
              "hover:bg-accent hover:text-foreground",
              "hover:translate-x-1 hover:shadow-sm",
            ].join(" ")
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      {active && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const params = useParams();
  const groupId = params?.id as string | undefined;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  return (
    <nav className="hidden md:flex flex-col w-60 shrink-0 border-r bg-card overflow-y-auto">
      <div className="flex-1 px-3 py-5 space-y-7">

        {/* Main nav */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 mb-2.5">
            Main Menu
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon }, i) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                delay={i * 50}
                active={
                  href === "/groups"
                    ? pathname === href || (pathname.startsWith("/groups") && !groupId)
                    : pathname === href
                }
              />
            ))}
          </div>
        </div>

        {/* Group nav */}
        {groupId && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between px-2 mb-2.5">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                Group
              </p>
              <Link
                href="/groups"
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors duration-150"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </Link>
            </div>

            <div className="space-y-1">
              {GROUP_TABS(groupId).map(({ tab: tabValue, label, icon }, i) => {
                const href = `/groups/${groupId}?tab=${tabValue}`;
                const isActive =
                  pathname === `/groups/${groupId}` &&
                  (tab === tabValue || (tab === null && tabValue === "treats"));
                return (
                  <NavLink
                    key={tabValue}
                    href={href}
                    label={label}
                    icon={icon}
                    delay={i * 50}
                    active={isActive}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
