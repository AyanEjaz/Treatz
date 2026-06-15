"use client";

import { CheckCircle2, Trash2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Treat } from "@/types/treat.types";
import { GroupMember } from "@/types/group.types";
import { useCompleteTreat, useDeleteTreat } from "@/hooks/useTreats";
import { formatRelativeTime } from "@/utils/date.utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface MemberTreatsTableProps {
  member: GroupMember;
  treats: Treat[];
  groupId: string;
  canComplete: boolean;
  canDelete: boolean;
}

function TreatRow({
  treat,
  groupId,
  canComplete,
  canDelete,
}: {
  treat: Treat;
  groupId: string;
  canComplete: boolean;
  canDelete: boolean;
}) {
  const { completeTreat, loading: completing } = useCompleteTreat();
  const { deleteTreat, loading: deleting } = useDeleteTreat(groupId);

  const handleComplete = async () => {
    try {
      await completeTreat(treat.id);
      toast.success("Treat marked complete!");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTreat(treat.id);
      toast.success("Treat deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <TableRow className={cn(treat.status === "COMPLETED" && "opacity-50")}>
      <TableCell className="font-medium text-sm">{treat.description}</TableCell>
      <TableCell className="text-sm text-muted-foreground italic">
        {treat.reason ?? <span className="text-muted-foreground/40">—</span>}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            treat.status === "PENDING"
              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              : "bg-green-500/10 text-green-600 dark:text-green-400"
          )}
        >
          {treat.status === "PENDING" ? "Pending" : "Done"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={treat.addedBy.avatar ?? undefined} alt={treat.addedBy.name} />
            <AvatarFallback className="text-xs">{initials(treat.addedBy.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{treat.addedBy.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(treat.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {canComplete && treat.status === "PENDING" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleComplete}
              disabled={completing}
              title="Mark complete"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function MemberTreatsTable({ member, treats, groupId, canComplete, canDelete }: MemberTreatsTableProps) {
  const pending = treats.filter((t) => t.status === "PENDING").length;
  const done = treats.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="rounded-lg border bg-card">
      {/* Member header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name} />
            <AvatarFallback className="text-sm font-semibold">{initials(member.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{member.user.name}</p>
            {member.user.username && <p className="text-xs text-muted-foreground">@{member.user.username}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {pending > 0 && (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs">
              {pending} pending
            </Badge>
          )}
          {done > 0 && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
              {done} done
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      {treats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
          <Gift className="h-8 w-8 opacity-30" />
          <p className="text-sm">No treats recorded for {member.user.name}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Treat</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Added By</TableHead>
              <TableHead className="text-xs">When</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treats.map((treat) => (
              <TreatRow
                key={treat.id}
                treat={treat}
                groupId={groupId}
                canComplete={canComplete}
                canDelete={canDelete}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
