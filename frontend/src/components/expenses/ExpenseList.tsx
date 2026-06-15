import { Receipt } from "lucide-react";
import { ExpenseCard } from "./ExpenseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Expense } from "@/types/expense.types";

interface ExpenseListProps {
  expenses: Expense[];
  groupId: string;
  loading: boolean;
  canManage?: boolean;
  action?: React.ReactNode;
}

export function ExpenseList({ expenses, groupId, loading, canManage, action }: ExpenseListProps) {
  if (loading) return <PageLoader />;

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Track shared expenses and see who owes whom."
        action={action}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} groupId={groupId} canManage={canManage} />
      ))}
    </div>
  );
}
