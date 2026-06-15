"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddExpense } from "@/hooks/useExpenses";
import { GroupMember } from "@/types/group.types";
import { formatCurrency } from "@/utils/currency.utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2, "Title min 2 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
});

type FormValues = z.infer<typeof schema>;

interface Settlement { from: string; to: string; amount: number }

function calcSettlements(
  selected: { name: string; paid: number; share: number }[]
): Settlement[] {
  const balances = selected.map((p) => ({
    name: p.name,
    balance: Math.round((p.paid - p.share) * 100) / 100,
  }));

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance);

  const txns: Settlement[] = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].balance, -debtors[j].balance);
    if (amount > 0.5) {
      txns.push({ from: debtors[j].name, to: creditors[i].name, amount: Math.round(amount) });
    }
    creditors[i].balance -= amount;
    debtors[j].balance += amount;
    if (creditors[i].balance < 0.01) i++;
    if (debtors[j].balance > -0.01) j++;
  }
  return txns;
}

interface ParticipantState {
  userId: string;
  name: string;
  selected: boolean;
  paid: string;
}

interface AddExpenseFormProps {
  groupId: string;
  members: GroupMember[];
  onSuccess?: () => void;
}

export function AddExpenseForm({ groupId, members, onSuccess }: AddExpenseFormProps) {
  const { addExpense, loading } = useAddExpense(groupId);
  const [totalAmount, setTotalAmount] = useState(0);
  const [participants, setParticipants] = useState<ParticipantState[]>(
    members.map((m) => ({ userId: m.user.id, name: m.user.name, selected: true, paid: "0" }))
  );

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const watchedAmount = watch("amount");
  useEffect(() => {
    setTotalAmount(Number(watchedAmount) || 0);
  }, [watchedAmount]);

  const toggleParticipant = (userId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, selected: !p.selected, paid: "0" } : p))
    );
  };

  const setPaid = (userId: string, value: string) => {
    setParticipants((prev) => prev.map((p) => (p.userId === userId ? { ...p, paid: value } : p)));
  };

  const selected = participants.filter((p) => p.selected);
  const totalPaid = selected.reduce((sum, p) => sum + (parseFloat(p.paid) || 0), 0);
  const remaining = Math.round((totalAmount - totalPaid) * 100) / 100;
  const share = selected.length > 0 ? Math.round((totalAmount / selected.length) * 100) / 100 : 0;
  const isBalanced = Math.abs(remaining) <= 0.5;

  const settlements = isBalanced && totalAmount > 0
    ? calcSettlements(selected.map((p) => ({ name: p.name, paid: parseFloat(p.paid) || 0, share })))
    : [];

  const onSubmit = async (values: FormValues) => {
    if (selected.length === 0) { toast.error("Select at least one participant"); return; }
    if (!isBalanced) {
      toast.error(`Paid amounts must equal total. Still unaccounted: ${formatCurrency(Math.abs(remaining))}`);
      return;
    }
    try {
      // Use integer paisa to avoid floating point drift (e.g. 4387/3 = 1462.33 * 3 = 4386.99)
      const totalPaisa = Math.round(values.amount * 100);
      const perPersonPaisa = Math.floor(totalPaisa / selected.length);
      const extraPaisa = totalPaisa - perPersonPaisa * selected.length;

      const participantData = selected.map((p, i) => ({
        userId: p.userId,
        paid: parseFloat(p.paid) || 0,
        owed: (perPersonPaisa + (i < extraPaisa ? 1 : 0)) / 100,
      }));
      await addExpense(values.title, values.amount, participantData);
      toast.success("Bill split added!");
      reset();
      setParticipants(members.map((m) => ({ userId: m.user.id, name: m.user.name, selected: true, paid: "0" })));
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">What was it for?</Label>
        <Input id="title" placeholder="e.g. Dinner at Kolachi" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Total Bill (RS)</Label>
        <Input id="amount" type="number" placeholder="0" {...register("amount")} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Who was there?</Label>
          {share > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(share)} each
            </span>
          )}
        </div>

        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleParticipant(p.userId)}
                className={cn(
                  "flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                  p.selected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "border-border text-muted-foreground opacity-50"
                )}
              >
                {p.name}
              </button>

              {p.selected && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground">Paid</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={p.paid}
                    onChange={(e) => setPaid(p.userId, e.target.value)}
                    className="w-24 h-8 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paid balance bar */}
        {totalAmount > 0 && selected.length > 0 && (
          <div className={cn(
            "rounded-xl px-3 py-2.5 text-xs flex items-center justify-between font-medium",
            isBalanced
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
          )}>
            <span>Paid: {formatCurrency(totalPaid)} / {formatCurrency(totalAmount)}</span>
            <span>{isBalanced ? "✓ All accounted" : `RS ${Math.abs(remaining)} left`}</span>
          </div>
        )}

        {/* Settlement preview */}
        {settlements.length > 0 && (
          <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-3 space-y-2">
            <p className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">
              Who pays whom
            </p>
            <div className="space-y-1.5">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">{s.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{s.to}</span>
                  <span className="ml-auto font-bold text-fuchsia-600 dark:text-fuchsia-400">
                    {formatCurrency(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {settlements.length === 0 && isBalanced && totalAmount > 0 && selected.length > 0 && (
          <div className="rounded-xl bg-green-500/10 px-3 py-2.5 text-xs text-green-600 dark:text-green-400 font-medium text-center">
            Everyone paid their exact share 🎉
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !isBalanced}>
        {loading ? "Saving..." : "Split Bill"}
      </Button>
    </form>
  );
}
