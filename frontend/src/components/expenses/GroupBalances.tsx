"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useGroupBalances, useRecordPayment } from "@/hooks/useExpenses";
import { Balance } from "@/types/expense.types";
import { formatCurrency } from "@/utils/currency.utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface GroupBalancesProps {
  groupId: string;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface BalanceRowProps {
  balance: Balance;
  groupId: string;
  isMyDebt: boolean;
}

function BalanceRow({ balance, groupId, isMyDebt }: BalanceRowProps) {
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState(String(balance.amount));
  const { recordPayment, loading } = useRecordPayment(groupId);

  const handlePay = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await recordPayment(balance.toUser.id, val);
      toast.success(`RS ${val} payment recorded!`);
      setPaying(false);
    } catch {
      toast.error("Failed to record payment");
    }
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={balance.fromUser.avatar ?? undefined} alt={balance.fromUser.name} />
          <AvatarFallback className="text-xs">{initials(balance.fromUser.name)}</AvatarFallback>
        </Avatar>
        <span className="text-sm">
          <span className="font-semibold">{balance.fromUser.name}</span>
          <span className="text-muted-foreground"> owes </span>
          <span className="font-semibold">{balance.toUser.name}</span>
        </span>
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={balance.toUser.avatar ?? undefined} alt={balance.toUser.name} />
          <AvatarFallback className="text-xs">{initials(balance.toUser.name)}</AvatarFallback>
        </Avatar>

        <span className="ml-auto text-base font-bold text-fuchsia-600 dark:text-fuchsia-400">
          {formatCurrency(balance.amount)}
        </span>

        {isMyDebt && !paying && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs shrink-0"
            onClick={() => { setAmount(String(balance.amount)); setPaying(true); }}
          >
            I Paid This
          </Button>
        )}
      </div>

      {paying && (
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs text-muted-foreground shrink-0">Amount paid RS</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-7 w-28 text-xs"
          />
          <Button size="sm" className="h-7 text-xs" onClick={handlePay} disabled={loading}>
            <Check className="h-3.5 w-3.5 mr-1" />
            Confirm
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPaying(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export function GroupBalances({ groupId }: GroupBalancesProps) {
  const { balances, loading } = useGroupBalances(groupId);
  const { currentUser } = useAuth();

  if (loading) return <LoadingSpinner size="sm" className="py-4" />;

  if (balances.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">All settled up!</p>
          <p className="text-xs text-muted-foreground mt-1">No outstanding balances</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Outstanding Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance, i) => (
          <BalanceRow
            key={i}
            balance={balance}
            groupId={groupId}
            isMyDebt={balance.fromUser.id === currentUser?.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}
