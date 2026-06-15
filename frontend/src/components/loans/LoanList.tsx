"use client";

import { HandCoins } from "lucide-react";
import { LoanCard } from "./LoanCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Loan } from "@/types/loan.types";

interface LoanListProps {
  loans: Loan[];
  groupId: string;
  currentUserId: string;
  loading: boolean;
  action?: React.ReactNode;
}

export function LoanList({ loans, groupId, currentUserId, loading, action }: LoanListProps) {
  if (loading) return <PageLoader />;

  const active = loans.filter((l) => l.status !== "SETTLED");
  const settled = loans.filter((l) => l.status === "SETTLED");

  if (loans.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="No loans recorded"
        description="Track who gave money to whom and when it was returned."
        action={action}
      />
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Outstanding ({active.length})</p>
          {active.map((loan) => (
            <LoanCard key={loan.id} loan={loan} groupId={groupId} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Settled ({settled.length})</p>
          {settled.map((loan) => (
            <LoanCard key={loan.id} loan={loan} groupId={groupId} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
