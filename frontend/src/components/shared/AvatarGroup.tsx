import { cn } from "@/lib/utils";

interface AvatarItem {
  id: string;
  name: string;
  avatar?: string | null;
}

interface AvatarGroupProps {
  users: AvatarItem[];
  max?: number;
  size?: "sm" | "md";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
};

export function AvatarGroup({ users, max = 4, size = "md" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className={cn(
            "rounded-full ring-2 ring-background flex items-center justify-center font-medium",
            "bg-primary text-primary-foreground",
            SIZE_CLASSES[size]
          )}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="rounded-full object-cover w-full h-full"
            />
          ) : (
            getInitials(user.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full ring-2 ring-background flex items-center justify-center font-medium",
            "bg-muted text-muted-foreground",
            SIZE_CLASSES[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
