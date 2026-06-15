import { cn } from "@/lib/utils";

type Status = "PENDING" | "COMPLETED" | "SETTLED";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const STATUS_STYLES: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  SETTLED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_LABELS: Record<Status, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  SETTLED: "Settled",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
