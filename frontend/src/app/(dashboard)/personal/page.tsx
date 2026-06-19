"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalSummary } from "@/components/personal/PersonalSummary";
import { PersonalNoteCard } from "@/components/personal/PersonalNoteCard";
import { AddPersonalNoteForm } from "@/components/personal/AddPersonalNoteForm";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useMyPersonalNotes, usePersonalNotesByPerson } from "@/hooks/usePersonal";
import { formatCurrency } from "@/utils/currency.utils";
import { PersonByName, PersonalNote } from "@/types/personal.types";
import { cn } from "@/lib/utils";

function PersonGroup({ group }: { group: PersonByName }) {
  const [open, setOpen] = useState(true);
  const active = group.notes.filter((n) => n.status !== "SETTLED");
  const settled = group.notes.filter((n) => n.status === "SETTLED");
  const hasOutstanding = active.length > 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
            hasOutstanding ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {group.personName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{group.personName}</p>
            <p className="text-xs text-muted-foreground">{group.notes.length} entr{group.notes.length !== 1 ? "ies" : "y"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {group.totalToReceive > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">To receive</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(group.totalToReceive)}</p>
            </div>
          )}
          {group.totalToGive > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">To give</p>
              <p className="text-sm font-semibold text-red-500">{formatCurrency(group.totalToGive)}</p>
            </div>
          )}
          {group.net !== 0 && (
            <Badge variant="secondary" className={cn("text-xs", group.net > 0 ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-500")}>
              Net {group.net > 0 ? "+" : ""}{formatCurrency(group.net)}
            </Badge>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t px-4 py-3 space-y-3">
          {active.map((note) => <PersonalNoteCard key={note.id} note={note} />)}
          {settled.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Settled</p>
              {settled.map((note) => <PersonalNoteCard key={note.id} note={note} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AllNotesList({ notes }: { notes: PersonalNote[] }) {
  const gave = notes.filter((n) => n.type === "GAVE" && n.status !== "SETTLED");
  const took = notes.filter((n) => n.type === "TOOK" && n.status !== "SETTLED");
  const settled = notes.filter((n) => n.status === "SETTLED");

  if (notes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">📝</p>
        <p className="font-medium">No entries yet</p>
        <p className="text-sm mt-1">Click &quot;Add Entry&quot; to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gave.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">💸 I gave — to receive ({gave.length})</p>
          {gave.map((n) => <PersonalNoteCard key={n.id} note={n} />)}
        </div>
      )}
      {took.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-red-500">🤝 They gave — to give back ({took.length})</p>
          {took.map((n) => <PersonalNoteCard key={n.id} note={n} />)}
        </div>
      )}
      {settled.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Settled ({settled.length})</p>
          {settled.map((n) => <PersonalNoteCard key={n.id} note={n} />)}
        </div>
      )}
    </div>
  );
}

export default function PersonalPage() {
  const { notes, loading } = useMyPersonalNotes();
  const { byPerson, loading: byPersonLoading } = usePersonalNotesByPerson();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Personal Ledger</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track who you gave money to or borrowed from</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Entry</DialogTitle></DialogHeader>
            <AddPersonalNoteForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <PersonalSummary />

      <Tabs defaultValue="byPerson">
        <TabsList>
          <TabsTrigger value="byPerson">By Person</TabsTrigger>
          <TabsTrigger value="all">All Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="byPerson" className="mt-4">
          {byPersonLoading ? (
            <PageLoader />
          ) : byPerson.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">No entries yet</p>
              <p className="text-sm mt-1">Click &quot;Add Entry&quot; to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {byPerson.map((group: PersonByName) => (
                <PersonGroup key={group.personName} group={group} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {loading ? <PageLoader /> : <AllNotesList notes={notes} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
