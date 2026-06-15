import { Users } from "lucide-react";
import { GroupCard } from "./GroupCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Group } from "@/types/group.types";

interface GroupListProps {
  groups: Group[];
  loading: boolean;
  action?: React.ReactNode;
}

export function GroupList({ groups, loading, action }: GroupListProps) {
  if (loading) return <PageLoader />;

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create a group or join one with an invite code to get started."
        action={action}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group, i) => (
        <GroupCard key={group.id} group={group} index={i} />
      ))}
    </div>
  );
}
