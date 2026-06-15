import { User } from "./user.types";
import { Group } from "./group.types";

export type ExpenseStatus = "PENDING" | "SETTLED";

export interface ExpenseSplit {
  id: string;
  user: User;
  paid: number;
  owed: number;
  settled: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  status: ExpenseStatus;
  splits: ExpenseSplit[];
  group: Group;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  fromUser: User;
  toUser: User;
  amount: number;
}
