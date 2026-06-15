"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGrantPermission, useRevokePermission } from "@/hooks/useGroup";
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
          <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
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

interface MemberPermissionsProps {
  members: GroupMember[];
  groupId: string;
}

export function MemberPermissions({ members, groupId }: MemberPermissionsProps) {
  const nonAdmins = members.filter((m) => m.role !== "ADMIN");
  const admins = members.filter((m) => m.role === "ADMIN");

  return (
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
  );
}
