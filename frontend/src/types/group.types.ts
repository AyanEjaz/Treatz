import { User } from "./user.types";

export type GroupRole = "ADMIN" | "MEMBER";

export type GroupPermission =
  | "ADD_TREAT"
  | "COMPLETE_TREAT"
  | "DELETE_TREAT"
  | "ADD_EXPENSE"
  | "SETTLE_EXPENSE"
  | "CONTRIBUTE_FUND";

export interface GroupMember {
  id: string;
  user: User;
  role: GroupRole;
  permissions: string[];
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  inviteCode: string;
  createdAt: string;
  members: GroupMember[];
  treatCount: number;
  expenseTotal: number;
  fundTotal: number;
}
