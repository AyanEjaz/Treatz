"use client";

import { Gift, Receipt, Banknote, PiggyBank, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGroupActivity } from "@/hooks/useActivity";

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

const TYPE_ICON: Record<string, { icon: typeof Gift; color: string; bg: string }> = {
  TREAT_ADDED:       { icon: Gift,         color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  TREAT_COMPLETED:   { icon: CheckCircle2, color: "text-green-500",   bg: "bg-green-500/10" },
  EXPENSE_ADDED:     { icon: Receipt,      color: "text-blue-500",    bg: "bg-blue-500/10" },
  EXPENSE_SETTLED:   { icon: CheckCircle2, color: "text-green-500",   bg: "bg-green-500/10" },
  LOAN_GIVEN:        { icon: Banknote,     color: "text-amber-500",   bg: "bg-amber-500/10" },
  FUND_CONTRIBUTED:  { icon: PiggyBank,    color: "text-violet-500",  bg: "bg-violet-500/10" },
  PAYMENT_RECORDED:  { icon: CreditCard,   color: "text-rose-500",    bg: "bg-rose-500/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ActivityItem({ log, index }: { log: ActivityLog; index: number }) {
  const meta = TYPE_ICON[log.type] ?? { icon: Receipt, color: "text-muted-foreground", bg: "bg-muted" };
  const Icon = meta.icon;

  return (
    <div
      className="flex items-start gap-3 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", meta.bg)}>
        <Icon className={cn("h-4 w-4", meta.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{log.user.name}</p>
        <p className="text-sm text-muted-foreground">{log.message}</p>
      </div>
      <span className="text-xs text-muted-foreground/60 shrink-0 mt-1">{timeAgo(log.createdAt)}</span>
    </div>
  );
}

export function ActivityFeed({ groupId }: { groupId: string }) {
  const { activity, loading } = useGroupActivity(groupId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No activity yet</p>
        <p className="text-sm mt-1">Actions will appear here as your group stays active</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activity.map((log: ActivityLog, i: number) => (
        <ActivityItem key={log.id} log={log} index={i} />
      ))}
    </div>
  );
}
