import Link from "next/link";
import { Users, Gift, Receipt, PiggyBank, ArrowUpRight } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { AvatarGroup } from "@/components/shared/AvatarGroup";
import { Group } from "@/types/group.types";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: Group;
  index?: number;
}

const GRADIENTS = [
  { strip: "from-fuchsia-500 to-rose-400",   bg: "from-fuchsia-500/10 to-rose-500/5"   },
  { strip: "from-violet-500 to-purple-400",   bg: "from-violet-500/10 to-purple-500/5"  },
  { strip: "from-emerald-500 to-teal-400",    bg: "from-emerald-500/10 to-teal-500/5"   },
  { strip: "from-amber-500 to-orange-400",    bg: "from-amber-500/10 to-orange-500/5"   },
  { strip: "from-sky-500 to-cyan-400",        bg: "from-sky-500/10 to-cyan-500/5"       },
];

function getGradient(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

export function GroupCard({ group, index = 0 }: GroupCardProps) {
  const members = group.members.map((m) => m.user);
  const g = getGradient(group.id);

  return (
    <Link href={`/groups/${group.id}`}>
      <div
        className={cn(
          "rounded-2xl border bg-card overflow-hidden cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-2 hover:shadow-xl",
          "hover:shadow-primary/15 group animate-fade-up"
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Gradient top bar */}
        <div className={cn("h-1.5 w-full bg-gradient-to-r", g.strip)} />

        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm truncate">{group.name}</h3>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200" />
              </div>
              {group.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
            <AvatarGroup users={members} max={3} size="sm" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Gift,     label: "Treats",   value: group.treatCount,    isAmount: false, color: "text-amber-500"   },
              { icon: Receipt,  label: "Expenses",  value: group.expenseTotal,  isAmount: true,  color: "text-violet-500"  },
              { icon: PiggyBank,label: "Fund",      value: group.fundTotal,     isAmount: true,  color: "text-emerald-500" },
            ].map(({ icon: Icon, label, value, isAmount, color }) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl p-2.5 text-center bg-gradient-to-br",
                  g.bg,
                  "transition-transform duration-200 hover:scale-105"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 mx-auto mb-1", color)} />
                {isAmount ? (
                  <CurrencyDisplay
                    amount={value as number}
                    size="sm"
                    className="text-xs font-bold block"
                  />
                ) : (
                  <p className="text-xs font-bold">{value}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>
              {group.members.length} member{group.members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </div>
    </Link>
  );
}
