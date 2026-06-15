import { User } from "./user.types";
import { Group } from "./group.types";

export type TreatStatus = "PENDING" | "COMPLETED";

export interface Treat {
  id: string;
  description: string;
  reason?: string | null;
  status: TreatStatus;
  ower: User;
  addedBy: User;
  group: Group;
  createdAt: string;
  updatedAt: string;
}
