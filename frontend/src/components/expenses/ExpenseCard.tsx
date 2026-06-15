"use client";

import { useState } from "react";
import { Trash2, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { formatRelativeTime } from "@/utils/date.utils";
import { formatCurrency } from "@/utils/currency.utils";
import { Expense } from "@/types/expense.types";
import { useSettleExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { toast } from "sonner";

interface ExpenseCardProps {
  expense: Expense;
  groupId: string;
  canManage?: boolean;
}

export function ExpenseCard({ expense, groupId, canManage = false }: ExpenseCardProps) {
  const { settleExpense, loading: settling } = useSettleExpense(groupId);
  const { deleteExpense, loading: deleting } = useDeleteExpense(groupId);
  const [expanded, setExpanded] = useState(false);

  const handleSettle = async () => {
    try {
      await settleExpense(expense.id);
      toast.success("Expense settled!");
    } catch {
      toast.error("Failed to settle expense");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const payers = expense.splits.filter((s) => s.paid > 0);

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{expense.title}</p>
              <StatusBadge status={expense.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payers.length > 0
                ? payers.map((p) => `${p.user.name} (${formatCurrency(p.paid)})`).join(", ") + " paid"
                : "No payments recorded"}
              {" · "}{expense.splits.length} people
              {" · "}{formatRelativeTime(expense.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <CurrencyDisplay amount={expense.amount} size="lg" />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded((v) => !v)}
              title="Show splits"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {canManage && expense.status === "PENDING" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleSettle}
                disabled={settling}
                title="Mark as settled"
              >
                <CheckCheck className="h-4 w-4 text-green-500" />
              </Button>
            )}

            {canManage && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete expense"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 border-t pt-3 space-y-1.5">
            {expense.splits.map((split) => {
              const net = split.paid - split.owed;
              return (
                <div key={split.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{split.user.name}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>Paid: {formatCurrency(split.paid)}</span>
                    <span>Share: {formatCurrency(split.owed)}</span>
                    <span className={net >= 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-red-500 font-medium"}>
                      {net >= 0 ? `+${formatCurrency(net)}` : formatCurrency(net)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
