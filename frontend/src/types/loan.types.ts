import { User } from "./user.types";

export type LoanStatus = "PENDING" | "PARTIAL" | "SETTLED";

export interface LoanRepayment {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
}

export interface Loan {
  id: string;
  amount: number;
  description?: string | null;
  status: LoanStatus;
  totalRepaid: number;
  remaining: number;
  lender: User;
  borrower: User;
  repayments: LoanRepayment[];
  createdAt: string;
}

export interface LoanSummary {
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
}
