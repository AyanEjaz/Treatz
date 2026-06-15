import { Gift, Receipt, PiggyBank, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Group } from "@/types/group.types";

interface GroupStatsProps {
  group: Group;
}

export function GroupStats({ group }: GroupStatsProps) {
  const stats = [
    {
      label: "Members",
      value: group.members.length,
      icon: Users,
      color: "text-purple-500",
      isNumber: true,
    },
    {
      label: "Treats",
      value: group.treatCount,
      icon: Gift,
      color: "text-amber-500",
      isNumber: true,
    },
    {
      label: "Total Expenses",
      value: group.expenseTotal,
      icon: Receipt,
      color: "text-blue-500",
      isNumber: false,
    },
    {
      label: "Group Fund",
      value: group.fundTotal,
      icon: PiggyBank,
      color: "text-green-500",
      isNumber: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color, isNumber }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            {isNumber ? (
              <p className="text-2xl font-bold">{value as number}</p>
            ) : (
              <CurrencyDisplay amount={value as number} size="xl" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
