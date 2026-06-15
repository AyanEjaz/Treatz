import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency.utils";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg font-semibold",
  xl: "text-2xl font-bold",
};

export function CurrencyDisplay({ amount, className, size = "md" }: CurrencyDisplayProps) {
  return (
    <span className={cn(SIZE_CLASSES[size], className)}>
      {formatCurrency(amount)}
    </span>
  );
}
