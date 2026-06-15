export type PersonalNoteType = "GAVE" | "TOOK";
export type PersonalNoteStatus = "PENDING" | "PARTIAL" | "SETTLED";

export interface PersonalRepayment {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
}

export interface PersonalNote {
  id: string;
  personName: string;
  type: PersonalNoteType;
  amount: number;
  description?: string | null;
  status: PersonalNoteStatus;
  totalRepaid: number;
  remaining: number;
  repayments: PersonalRepayment[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalSummary {
  totalToReceive: number;
  totalToGive: number;
  netBalance: number;
  pendingCount: number;
}

export interface PersonByName {
  personName: string;
  totalToReceive: number;
  totalToGive: number;
  net: number;
  notes: PersonalNote[];
}
