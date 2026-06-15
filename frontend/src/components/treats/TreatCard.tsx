"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/utils/date.utils";
import { Treat } from "@/types/treat.types";
import { useCompleteTreat, useDeleteTreat } from "@/hooks/useTreats";
import { toast } from "sonner";

interface TreatCardProps {
  treat: Treat;
  groupId: string;
  canComplete?: boolean;
  canDelete?: boolean;
}

export function TreatCard({ treat, groupId, canComplete = false, canDelete = false }: TreatCardProps) {
  const { completeTreat, loading: completing } = useCompleteTreat();
  const { deleteTreat, loading: deleting } = useDeleteTreat(groupId);

  const handleComplete = async () => {
    try {
      await completeTreat(treat.id);
      toast.success("Treat marked as complete!");
    } catch {
      toast.error("Failed to complete treat");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTreat(treat.id);
      toast.success("Treat deleted");
    } catch {
      toast.error("Failed to delete treat");
    }
  };

  return (
    <div className="group flex items-start justify-between gap-3 py-2 px-3 rounded-md hover:bg-muted/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{treat.description}</p>
        {treat.reason && (
          <p className="text-xs text-muted-foreground mt-0.5 italic">&ldquo;{treat.reason}&rdquo;</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          Added by {treat.addedBy.name} · {formatRelativeTime(treat.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <StatusBadge status={treat.status} />

        {canComplete && treat.status === "PENDING" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleComplete}
            disabled={completing}
            title="Mark as complete"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </Button>
        )}

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete treat"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
