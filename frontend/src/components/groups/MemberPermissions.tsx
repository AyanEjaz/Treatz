"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGrantPermission, useRevokePermission, useDeleteGroup } from "@/hooks/useGroup";
import { GroupMember, GroupPermission } from "@/types/group.types";
import { toast } from "sonner";

const PERMISSIONS: { key: GroupPermission; label: string }[] = [
  { key: "ADD_TREAT", label: "Add Treat" },
  { key: "COMPLETE_TREAT", label: "Complete Treat" },
  { key: "DELETE_TREAT", label: "Delete Treat" },
  { key: "ADD_EXPENSE", label: "Add Expense" },
  { key: "SETTLE_EXPENSE", label: "Settle Expense" },
  { key: "CONTRIBUTE_FUND", label: "Contribute to Fund" },
];

interface MemberRowProps {
  member: GroupMember;
  groupId: string;
}

function MemberRow({ member, groupId }: MemberRowProps) {
  const { grantPermission, loading: granting } = useGrantPermission(groupId);
  const { revokePermission, loading: revoking } = useRevokePermission(groupId);
  const initials = member.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isAdmin = member.role === "ADMIN";

  const toggle = async (key: GroupPermission, hasIt: boolean) => {
    try {
      if (hasIt) {
        await revokePermission(member.user.id, key);
        toast.success("Permission revoked");
      } else {
        await grantPermission(member.user.id, key);
        toast.success("Permission granted");
      }
    } catch {
      toast.error("Failed to update permission");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{member.user.name}</p>
          {member.user.username && (
            <p className="text-xs text-muted-foreground truncate">@{member.user.username}</p>
          )}
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
          {member.role}
        </Badge>
      </div>

      {!isAdmin && (
        <div className="flex flex-wrap gap-2 pl-12">
          {PERMISSIONS.map(({ key, label }) => {
            const hasIt = member.permissions.includes(key);
            return (
              <Button
                key={key}
                variant={hasIt ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                disabled={granting || revoking}
                onClick={() => toggle(key, hasIt)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <p className="text-xs text-muted-foreground pl-12">Admin has all permissions</p>
      )}
    </div>
  );
}

function DeleteGroupSection({ groupId, groupName }: { groupId: string; groupName: string }) {
  const router = useRouter();
  const { deleteGroup, loading } = useDeleteGroup();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    try {
      await deleteGroup(groupId);
      toast.success("Group deleted");
      router.push("/groups");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete group");
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Permanently delete this group, including all treats, expenses, loans and history. This cannot be undone.
          </p>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmText(""); }}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="shrink-0">Delete Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete &quot;{groupName}&quot;?</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete the group and all its data for every member. Type{" "}
                  <span className="font-semibold text-foreground">{groupName}</span> to confirm.
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={groupName}
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={confirmText !== groupName || loading}
                  onClick={handleDelete}
                >
                  {loading ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

interface MemberPermissionsProps {
  members: GroupMember[];
  groupId: string;
  groupName: string;
}

export function MemberPermissions({ members, groupId, groupName }: MemberPermissionsProps) {
  const nonAdmins = members.filter((m) => m.role !== "ADMIN");
  const admins = members.filter((m) => m.role === "ADMIN");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Member Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {admins.map((m, i) => (
            <div key={m.user.id}>
              <MemberRow member={m} groupId={groupId} />
              {i < admins.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          {admins.length > 0 && nonAdmins.length > 0 && <Separator />}
          {nonAdmins.map((m, i) => (
            <div key={m.user.id}>
              <MemberRow member={m} groupId={groupId} />
              {i < nonAdmins.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No members found</p>
          )}
        </CardContent>
      </Card>

      <DeleteGroupSection groupId={groupId} groupName={groupName} />
    </div>
  );
}
