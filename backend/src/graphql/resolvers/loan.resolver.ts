import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/context.types";
import { logActivity } from "../../utils/activity.utils";

function requireAuth(currentUser: GraphQLContext["currentUser"]) {
  if (!currentUser)
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return currentUser;
}

async function requireMember(prisma: GraphQLContext["prisma"], groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!member) throw new GraphQLError("Not a member of this group");
  return member;
}

function computeLoanStatus(amount: number, totalRepaid: number): string {
  if (totalRepaid <= 0) return "PENDING";
  if (totalRepaid >= amount - 0.01) return "SETTLED";
  return "PARTIAL";
}

export const loanResolvers = {
  Query: {
    groupLoans: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      requireAuth(currentUser);
      const loans = await prisma.loan.findMany({
        where: { groupId },
        include: { repayments: true },
        orderBy: { createdAt: "desc" },
      });
      return loans.map((loan) => {
        const totalRepaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
        return {
          ...loan,
          totalRepaid,
          remaining: Math.max(0, loan.amount - totalRepaid),
          status: computeLoanStatus(loan.amount, totalRepaid),
        };
      });
    },

    myLoanSummary: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const loans = await prisma.loan.findMany({
        where: { groupId, OR: [{ lenderId: user.id }, { borrowerId: user.id }] },
        include: { repayments: true },
      });

      let totalLent = 0;
      let totalBorrowed = 0;

      for (const loan of loans) {
        const totalRepaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
        const remaining = Math.max(0, loan.amount - totalRepaid);
        if (loan.lenderId === user.id) totalLent += remaining;
        else totalBorrowed += remaining;
      }

      return { totalLent, totalBorrowed, netBalance: totalLent - totalBorrowed };
    },
  },

  Mutation: {
    giveLoan: async (
      _: unknown,
      { groupId, borrowerId, amount, description }: { groupId: string; borrowerId: string; amount: number; description?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await requireMember(prisma, groupId, user.id);
      if (user.id === borrowerId) throw new GraphQLError("Cannot give a loan to yourself");

      const loan = await prisma.loan.create({
        data: { groupId, lenderId: user.id, borrowerId, amount, description },
        include: { repayments: true },
      });
      await logActivity(prisma, groupId, user.id, "LOAN_GIVEN", `Gave a loan of RS ${amount}`);
      return { ...loan, totalRepaid: 0, remaining: loan.amount, status: "PENDING" };
    },

    repayLoan: async (
      _: unknown,
      { loanId, amount, note }: { loanId: string; amount: number; note?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { repayments: true },
      });
      if (!loan) throw new GraphQLError("Loan not found");

      const alreadyRepaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
      const remaining = loan.amount - alreadyRepaid;
      if (amount > remaining + 0.01) throw new GraphQLError(`Cannot repay more than remaining: RS ${remaining}`);

      // both lender and borrower can record repayment
      if (loan.lenderId !== user.id && loan.borrowerId !== user.id) {
        await requireMember(prisma, loan.groupId, user.id);
        const member = await prisma.groupMember.findUnique({
          where: { userId_groupId: { userId: user.id, groupId: loan.groupId } },
        });
        if (member?.role !== "ADMIN") throw new GraphQLError("Only lender, borrower, or admin can record repayment");
      }

      await prisma.loanRepayment.create({ data: { loanId, amount, note } });

      const updated = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { repayments: true },
      });
      const totalRepaid = updated!.repayments.reduce((s, r) => s + r.amount, 0);
      return {
        ...updated,
        totalRepaid,
        remaining: Math.max(0, updated!.amount - totalRepaid),
        status: computeLoanStatus(updated!.amount, totalRepaid),
      };
    },

    deleteLoan: async (
      _: unknown,
      { loanId }: { loanId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const loan = await prisma.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new GraphQLError("Loan not found");

      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId: loan.groupId } },
      });
      if (loan.lenderId !== user.id && member?.role !== "ADMIN")
        throw new GraphQLError("Only the lender or an admin can delete this loan");

      await prisma.loan.delete({ where: { id: loanId } });
      return true;
    },
  },

  Loan: {
    lender: (parent: { lenderId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.lenderId } }),
    borrower: (parent: { borrowerId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.borrowerId } }),
    repayments: (parent: { id: string; repayments?: unknown[] }, _: unknown, { prisma }: GraphQLContext) => {
      if (parent.repayments) return parent.repayments;
      return prisma.loanRepayment.findMany({ where: { loanId: parent.id }, orderBy: { createdAt: "desc" } });
    },
  },
};
