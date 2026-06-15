"use client";

import { TrendingUp, TrendingDown, Scale, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMyPersonalSummary } from "@/hooks/usePersonal";
import { formatCurrency } from "@/utils/currency.utils";

export function PersonalSummary() {
  const { summary, loading } = useMyPersonalSummary();
  if (loading) return null;

  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">To Receive</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalToReceive)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">outstanding</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">To Give Back</span>
          </div>
          <p className="text-lg font-bold text-red-500">{formatCurrency(summary.totalToGive)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">to return</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Net</span>
          </div>
          <p className={`text-lg font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{formatCurrency(summary.netBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{isPositive ? "in your favour" : "you owe more"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-lg font-bold">{summary.pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">entries</p>
        </CardContent>
      </Card>
    </div>
  );
}
