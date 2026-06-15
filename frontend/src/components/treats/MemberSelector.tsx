"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GroupMember } from "@/types/group.types";
import { Treat } from "@/types/treat.types";
import { cn } from "@/lib/utils";

interface MemberSelectorProps {
  members: GroupMember[];
  treats: Treat[];
  selectedId: string | null;
  onSelect: (userId: string) => void;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function MemberSelector({ members, treats, selectedId, onSelect }: MemberSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {members.map((member) => {
        const memberTreats = treats.filter((t) => t.ower.id === member.user.id);
        const pending = memberTreats.filter((t) => t.status === "PENDING").length;
        const isSelected = selectedId === member.user.id;

        return (
          <button
            key={member.user.id}
            type="button"
            onClick={() => onSelect(member.user.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all shrink-0 w-24",
              isSelected
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name} />
                <AvatarFallback className="text-sm font-semibold">{initials(member.user.name)}</AvatarFallback>
              </Avatar>
              {pending > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-destructive text-destructive-foreground border-2 border-background">
                  {pending}
                </Badge>
              )}
            </div>
            <div className="text-center">
              <p className={cn("text-xs font-medium leading-tight truncate w-full", isSelected ? "text-primary" : "text-foreground")}>
                {member.user.name.split(" ")[0]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {memberTreats.length} treat{memberTreats.length !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
