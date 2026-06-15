import { PiggyBank, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { FundSummary } from "@/types/fund.types";

interface FundBalanceProps {
  fund: FundSummary;
}

export function FundBalance({ fund }: FundBalanceProps) {
  const contributorCount = new Set(fund.contributions.map((c) => c.user.id)).size;

  return (
    <Card className="border-green-200 dark:border-green-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
          <PiggyBank className="h-4 w-4 text-green-500" />
          Group Fund Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CurrencyDisplay amount={fund.total} size="xl" className="text-green-600 dark:text-green-400" />
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>{fund.contributions.length} contribution{fund.contributions.length !== 1 ? "s" : ""}</span>
          {" · "}
          <span>{contributorCount} contributor{contributorCount !== 1 ? "s" : ""}</span>
        </div>
      </CardContent>
    </Card>
  );
}
