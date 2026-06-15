"use client";

import { useState } from "react";
import { Trash2, Pencil, ChevronDown, ChevronUp, RotateCcw, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PersonalNote } from "@/types/personal.types";
import { useAddPersonalRepayment, useDeletePersonalNote, useEditPersonalNote } from "@/hooks/usePersonal";
import { formatCurrency } from "@/utils/currency.utils";
import { formatDate, formatRelativeTime } from "@/utils/date.utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STYLE = {
  PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  PARTIAL: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  SETTLED: "bg-green-500/10 text-green-600 dark:text-green-400",
};

interface PersonalNoteCardProps {
  note: PersonalNote;
}

export function PersonalNoteCard({ note }: PersonalNoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const [repayAmount, setRepayAmount] = useState(String(note.remaining));
  const [repayNote, setRepayNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(note.personName);
  const [editAmount, setEditAmount] = useState(String(note.amount));
  const [editDesc, setEditDesc] = useState(note.description ?? "");

  const { addRepayment, loading: repaying_ } = useAddPersonalRepayment();
  const { deleteNote, loading: deleting } = useDeletePersonalNote();
  const { editNote, loading: saving } = useEditPersonalNote();

  const isGave = note.type === "GAVE";
  const progressPercent = Math.min(100, Math.round((note.totalRepaid / note.amount) * 100));

  const handleRepay = async () => {
    const val = parseFloat(repayAmount);
    if (!val || val <= 0) { toast.error("Enter valid amount"); return; }
    try {
      await addRepayment(note.id, val, repayNote || undefined);
      toast.success("Repayment recorded!");
      setRepaying(false);
      setRepayNote("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleEdit = async () => {
    try {
      await editNote(note.id, editName, parseFloat(editAmount) || undefined, editDesc || undefined);
      toast.success("Updated!");
      setEditing(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <Card className={cn(note.status === "SETTLED" && "opacity-55")}>
      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm font-semibold" placeholder="Person name" />
                <div className="flex gap-2">
                  <Input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} type="number" className="h-8 text-sm w-28" placeholder="Amount" />
                  <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 text-sm flex-1" placeholder="Note (optional)" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleEdit} disabled={saving}>
                    <Check className="h-3 w-3 mr-1" />Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>
                    <X className="h-3 w-3 mr-1" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", isGave ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-500")}>
                    {isGave ? "💸 I gave" : "🤝 They gave"}
                  </span>
                  <span className="text-sm font-bold">{note.personName}</span>
                  <Badge variant="secondary" className={cn("text-xs", STATUS_STYLE[note.status])}>
                    {note.status === "PENDING" ? "Pending" : note.status === "PARTIAL" ? "Partial" : "Settled"}
                  </Badge>
                </div>
                {note.description && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{note.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(note.createdAt)}</p>
              </>
            )}
          </div>

          {!editing && (
            <div className="shrink-0 text-right">
              <p className="text-base font-bold">{formatCurrency(note.amount)}</p>
              {note.status !== "SETTLED" && (
                <p className="text-xs text-muted-foreground">
                  Remaining: <span className={cn("font-semibold", isGave ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                    {formatCurrency(note.remaining)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!editing && note.amount > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", isGave ? "bg-green-500" : "bg-red-400")}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(note.totalRepaid)} returned ({progressPercent}%)
            </p>
          </div>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex gap-2 flex-wrap">
            {note.status !== "SETTLED" && !repaying && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRepayAmount(String(note.remaining)); setRepaying(true); }}>
                <RotateCcw className="h-3 w-3 mr-1" />
                {isGave ? "Record receipt" : "Record payment"}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setExpanded((v) => !v)}>
              History {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Inline repay */}
        {repaying && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">{isGave ? "How much did you receive?" : "How much did you pay back?"}</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-muted-foreground shrink-0">RS</span>
                <Input type="number" min="0" step="0.01" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} className="h-7 text-xs" />
              </div>
              <Input placeholder="Note (optional)" value={repayNote} onChange={(e) => setRepayNote(e.target.value)} className="h-7 text-xs flex-1" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleRepay} disabled={repaying_}>Confirm</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRepaying(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* History */}
        {expanded && (
          <div className="border-t pt-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Payment History</p>
            {note.repayments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No repayments recorded yet</p>
            ) : (
              note.repayments.map((r) => (
                <div key={r.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{formatDate(r.createdAt)}{r.note ? ` · ${r.note}` : ""}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(r.amount)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
