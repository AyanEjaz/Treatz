"use client";

import Link from "next/link";
import { Users, TrendingUp, TrendingDown, Wallet, ArrowRight, Gift } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyGroups } from "@/hooks/useGroup";
import { useMyPersonalSummary } from "@/hooks/usePersonal";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";
import { GroupCard } from "@/components/groups/GroupCard";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Group } from "@/types/group.types";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  blobClass: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  href?: string;
  delay?: number;
}

function StatCard({
  title, value, subtitle, icon: Icon,
  blobClass, iconBg, iconColor, valueColor, href, delay = 0,
}: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5",
        "transition-all duration-300 ease-out animate-fade-up",
        "hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10",
        href && "cursor-pointer"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -right-5 -top-5 h-24 w-24 rounded-full blur-2xl opacity-20 transition-opacity duration-300",
        blobClass
      )} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={cn("text-2xl font-extrabold mt-1.5 tracking-tight", valueColor ?? "text-foreground")}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className={cn(
          "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
          "transition-transform duration-300 hover:scale-110",
          iconBg
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { groups, loading } = useMyGroups();
  const { summary } = useMyPersonalSummary();
  const { currentUser } = useAuth();

  const firstName = currentUser?.name?.split(" ")[0] ?? "";
  const net = summary.totalToReceive - summary.totalToGive;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {firstName ? `Hey, ${firstName} 👋` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here&apos;s your financial overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Groups"
          value={String(groups.length)}
          subtitle={groups.length === 1 ? "active group" : "active groups"}
          icon={Users}
          blobClass="bg-fuchsia-500"
          iconBg="bg-fuchsia-500/10"
          iconColor="text-fuchsia-500"
          href="/groups"
          delay={0}
        />
        <StatCard
          title="To Receive"
          value={formatCurrency(summary.totalToReceive)}
          subtitle="personal ledger"
          icon={TrendingUp}
          blobClass="bg-emerald-500"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          valueColor="text-emerald-600 dark:text-emerald-400"
          href="/personal"
          delay={80}
        />
        <StatCard
          title="To Give Back"
          value={formatCurrency(summary.totalToGive)}
          subtitle="personal ledger"
          icon={TrendingDown}
          blobClass="bg-rose-500"
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
          valueColor="text-rose-500"
          href="/personal"
          delay={160}
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(Math.abs(net))}
          subtitle={net >= 0 ? "in your favor" : "you owe more"}
          icon={Wallet}
          blobClass={net >= 0 ? "bg-emerald-500" : "bg-amber-500"}
          iconBg={net >= 0 ? "bg-emerald-500/10" : "bg-amber-500/10"}
          iconColor={net >= 0 ? "text-emerald-600" : "text-amber-600"}
          valueColor={net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
          href="/personal"
          delay={240}
        />
      </div>

      {/* Recent groups */}
      <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">Your Groups</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/50 py-14 text-center animate-fade-up">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-fuchsia-500" />
            </div>
            <p className="font-semibold text-muted-foreground">No groups yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Go to{" "}
              <Link href="/groups" className="text-primary hover:underline font-medium">
                Groups
              </Link>{" "}
              to create or join one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 3).map((group: Group, i: number) => (
              <GroupCard key={group.id} group={group} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
