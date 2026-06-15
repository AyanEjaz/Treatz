"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { MemberSelector } from "./MemberSelector";
import { MemberTreatsTable } from "./MemberTreatsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Treat } from "@/types/treat.types";
import { GroupMember } from "@/types/group.types";

interface TreatListProps {
  treats: Treat[];
  members: GroupMember[];
  groupId: string;
  loading: boolean;
  canComplete?: boolean;
  canDelete?: boolean;
  action?: React.ReactNode;
}

export function TreatList({ treats, members, groupId, loading, canComplete = false, canDelete = false, action }: TreatListProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    members.length > 0 ? members[0].user.id : null
  );

  if (loading) return <PageLoader />;

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="No members yet"
        description="Invite members to start tracking treats."
        action={action}
      />
    );
  }

  const handleSelect = (userId: string) => {
    setSelectedMemberId((prev) => (prev === userId ? null : userId));
  };

  const selectedMember = members.find((m) => m.user.id === selectedMemberId) ?? null;
  const selectedTreats = selectedMember
    ? treats.filter((t) => t.ower.id === selectedMember.user.id)
    : [];

  return (
    <div className="space-y-5">
      <MemberSelector
        members={members}
        treats={treats}
        selectedId={selectedMemberId}
        onSelect={handleSelect}
      />

      {selectedMember ? (
        <MemberTreatsTable
          member={selectedMember}
          treats={selectedTreats}
          groupId={groupId}
          canComplete={canComplete}
          canDelete={canDelete}
        />
      ) : (
        <div className="rounded-lg border bg-card/50 py-12 text-center text-sm text-muted-foreground">
          Select a member above to view their treats
        </div>
      )}
    </div>
  );
}
