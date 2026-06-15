"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/utils/currency.utils";
import { formatDate, formatRelativeTime } from "@/utils/date.utils";
import { Loan } from "@/types/loan.types";
import { useRepayLoan, useDeleteLoan } from "@/hooks/useLoans";
import { toast } from "sonner";

const STATUS_STYLES = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  PARTIAL: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  SETTLED: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const STATUS_LABELS = { PENDING: "Pending", PARTIAL: "Partial", SETTLED: "Settled" };

interface LoanCardProps {
  loan: Loan;
  groupId: string;
  currentUserId: string;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function LoanCard({ loan, groupId, currentUserId }: LoanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const [repayAmount, setRepayAmount] = useState(String(loan.remaining));
  const [repayNote, setRepayNote] = useState("");

  const { repayLoan, loading: repaying_ } = useRepayLoan(groupId);
  const { deleteLoan, loading: deleting } = useDeleteLoan(groupId);

  const isLender = loan.lender.id === currentUserId;
  const isBorrower = loan.borrower.id === currentUserId;
  const canDelete = isLender;
  const canRepay = (isLender || isBorrower) && loan.status !== "SETTLED";

  const progressPercent = Math.min(100, Math.round((loan.totalRepaid / loan.amount) * 100));

  const handleRepay = async () => {
    const val = parseFloat(repayAmount);
    if (!val || val <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      await repayLoan(loan.id, val, repayNote || undefined);
      toast.success("Repayment recorded!");
      setRepaying(false);
      setRepayNote("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record repayment");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLoan(loan.id);
      toast.success("Loan deleted");
    } catch {
      toast.error("Failed to delete loan");
    }
  };

  return (
    <Card className={loan.status === "SETTLED" ? "opacity-60" : ""}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={loan.lender.avatar ?? undefined} alt={loan.lender.name} />
                <AvatarFallback className="text-xs">{initials(loan.lender.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground shrink-0">→</span>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={loan.borrower.avatar ?? undefined} alt={loan.borrower.name} />
                <AvatarFallback className="text-xs">{initials(loan.borrower.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className="text-foreground">{loan.lender.name}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-foreground">{loan.borrower.name}</span>
              </p>
              {loan.description && (
                <p className="text-xs text-muted-foreground truncate">{loan.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatRelativeTime(loan.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold">{formatCurrency(loan.amount)}</p>
              {loan.status !== "SETTLED" && (
                <p className="text-xs text-muted-foreground">
                  Remaining: <span className="text-red-500 font-medium">{formatCurrency(loan.remaining)}</span>
                </p>
              )}
            </div>
            <Badge className={`text-xs ${STATUS_STYLES[loan.status]}`} variant="secondary">
              {STATUS_LABELS[loan.status]}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        {loan.amount > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(loan.totalRepaid)} returned ({progressPercent}%)
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {canRepay && !repaying && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => { setRepayAmount(String(loan.remaining)); setRepaying(true); }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Record Return
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            History {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-destructive hover:text-destructive ml-auto"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Repay inline form */}
        {repaying && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">Record Repayment</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-xs text-muted-foreground shrink-0">RS</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <Input
                placeholder="Note (optional)"
                value={repayNote}
                onChange={(e) => setRepayNote(e.target.value)}
                className="h-7 text-xs flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleRepay} disabled={repaying_}>
                Confirm
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRepaying(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Repayment history */}
        {expanded && (
          <div className="border-t pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Return History</p>
            {loan.repayments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No repayments yet</p>
            ) : (
              loan.repayments.map((r) => (
                <div key={r.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{formatDate(r.createdAt)}{r.note ? ` · ${r.note}` : ""}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(r.amount)}</span>
                </div>
              ))
            )}
            <div className="flex justify-between text-xs border-t pt-1.5 mt-1.5">
              <span className="font-medium">Total returned</span>
              <span className="font-bold">{formatCurrency(loan.totalRepaid)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
