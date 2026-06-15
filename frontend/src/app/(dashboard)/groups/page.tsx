"use client";

import { useState } from "react";
import { Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GroupList } from "@/components/groups/GroupList";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { useMyGroups, useJoinGroup } from "@/hooks/useGroup";
import { toast } from "sonner";

export default function GroupsPage() {
  const { groups, loading } = useMyGroups();
  const { joinGroup, loading: joining } = useJoinGroup();
  const [inviteInput, setInviteInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const handleJoin = async () => {
    if (!inviteInput.trim()) return;
    try {
      await joinGroup(inviteInput.trim().toUpperCase());
      toast.success("Joined group successfully!");
      setJoinOpen(false);
      setInviteInput("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to join group");
    }
  };

  const emptyAction = (
    <div className="flex gap-2 justify-center flex-wrap mt-2">
      <Button variant="outline" size="sm" onClick={() => setJoinOpen(true)}>
        <LogIn className="h-4 w-4 mr-1.5" />Join Group
      </Button>
      <Button size="sm" onClick={() => setCreateOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />New Group
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {groups.length > 0
              ? `${groups.length} group${groups.length !== 1 ? "s" : ""} you're part of`
              : "Manage your friend groups"}
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-1.5" />Join
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Join a Group</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Enter invite code"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="uppercase"
                />
                <Button onClick={handleJoin} disabled={joining || !inviteInput.trim()} className="w-full">
                  {joining ? "Joining..." : "Join Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" />New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a Group</DialogTitle></DialogHeader>
              <CreateGroupForm onSuccess={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <GroupList groups={groups} loading={loading} action={emptyAction} />
    </div>
  );
}
