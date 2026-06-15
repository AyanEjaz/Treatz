import { User } from "./user.types";
import { Group } from "./group.types";

export interface FundContribution {
  id: string;
  amount: number;
  note?: string | null;
  user: User;
  group: Group;
  createdAt: string;
}

export interface FundSummary {
  total: number;
  contributions: FundContribution[];
}
