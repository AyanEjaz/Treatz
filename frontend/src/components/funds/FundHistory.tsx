import { PiggyBank } from "lucide-react";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRelativeTime } from "@/utils/date.utils";
import { FundContribution } from "@/types/fund.types";

interface FundHistoryProps {
  contributions: FundContribution[];
  action?: React.ReactNode;
}

export function FundHistory({ contributions, action }: FundHistoryProps) {
  if (contributions.length === 0) {
    return (
      <EmptyState
        icon={PiggyBank}
        title="No contributions yet"
        description="Start building the group fund by making a contribution."
        action={action}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {contributions.map((contribution) => (
        <div
          key={contribution.id}
          className="flex items-center justify-between rounded-lg border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{contribution.user.name}</p>
              {contribution.note && (
                <p className="text-xs text-muted-foreground">{contribution.note}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatRelativeTime(contribution.createdAt)}</p>
            </div>
          </div>
          <CurrencyDisplay
            amount={contribution.amount}
            size="lg"
            className="text-green-600 dark:text-green-400"
          />
        </div>
      ))}
    </div>
  );
}
