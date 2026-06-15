"use client";

import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMyLoanSummary } from "@/hooks/useLoans";
import { formatCurrency } from "@/utils/currency.utils";

interface LoanSummaryProps {
  groupId: string;
}

export function LoanSummary({ groupId }: LoanSummaryProps) {
  const { summary, loading } = useMyLoanSummary(groupId);

  if (loading) return null;

  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">You lent</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summary.totalLent)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">outstanding</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">You owe</span>
          </div>
          <p className="text-lg font-bold text-red-500">
            {formatCurrency(summary.totalBorrowed)}
          </p>
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
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPositive ? "in your favour" : "you owe more"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
