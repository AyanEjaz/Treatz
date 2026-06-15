import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { GraphQLContext } from "../../types/context.types";
import { pubsub, SUBSCRIPTION_EVENTS } from "../../utils/pubsub.utils";
import { logActivity } from "../../utils/activity.utils";

interface ParticipantInput { userId: string; paid: number; owed?: number }

interface NetBalance { userId: string; amount: number }

function requireAuth(currentUser: GraphQLContext["currentUser"]) {
  if (!currentUser)
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return currentUser;
}

async function checkPermission(
  prisma: GraphQLContext["prisma"],
  groupId: string,
  userId: string,
  permission: string
) {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!member) throw new GraphQLError("Not a member of this group");
  if (member.role === "ADMIN") return;
  if (!member.permissions.includes(permission))
    throw new GraphQLError(`Permission denied: ${permission}`);
}

function computeSettlements(splits: { userId: string; paid: number; owed: number }[]) {
  const net: Record<string, number> = {};
  for (const s of splits) {
    net[s.userId] = (net[s.userId] ?? 0) + s.paid - s.owed;
  }

  const creditors: NetBalance[] = [];
  const debtors: NetBalance[] = [];
  for (const [userId, amount] of Object.entries(net)) {
    if (amount > 0.01) creditors.push({ userId, amount });
    else if (amount < -0.01) debtors.push({ userId, amount: Math.abs(amount) });
  }

  const settlements: { fromUserId: string; toUserId: string; amount: number }[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debit = debtors[di];
    const settle = Math.min(credit.amount, debit.amount);
    settlements.push({ fromUserId: debit.userId, toUserId: credit.userId, amount: Math.round(settle * 100) / 100 });
    credit.amount -= settle;
    debit.amount -= settle;
    if (credit.amount < 0.01) ci++;
    if (debit.amount < 0.01) di++;
  }
  return settlements;
}

export const expenseResolvers = {
  Query: {
    groupExpenses: (_: unknown, { groupId }: { groupId: string }, { prisma, currentUser }: GraphQLContext) => {
      requireAuth(currentUser);
      return prisma.expense.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } });
    },

    groupBalances: async (_: unknown, { groupId }: { groupId: string }, { prisma, currentUser }: GraphQLContext) => {
      requireAuth(currentUser);
      const [splits, payments] = await Promise.all([
        prisma.expenseSplit.findMany({
          where: { expense: { groupId }, settled: false },
          select: { userId: true, paid: true, owed: true },
        }),
        prisma.payment.findMany({
          where: { groupId },
          select: { fromId: true, toId: true, amount: true },
        }),
      ]);

      // Build net from expense splits
      const net: Record<string, number> = {};
      for (const s of splits) {
        net[s.userId] = (net[s.userId] ?? 0) + s.paid - s.owed;
      }
      // Factor in recorded payments: payment reduces the debt
      for (const p of payments) {
        net[p.fromId] = (net[p.fromId] ?? 0) + p.amount;  // paid → credit
        net[p.toId] = (net[p.toId] ?? 0) - p.amount;      // received → debit
      }

      const settlements = computeSettlements(
        Object.entries(net).map(([userId, balance]) => ({ userId, paid: balance > 0 ? balance : 0, owed: balance < 0 ? -balance : 0 }))
      );
      return settlements;
    },

    groupPayments: async (_: unknown, { groupId }: { groupId: string }, { prisma, currentUser }: GraphQLContext) => {
      requireAuth(currentUser);
      return prisma.payment.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } });
    },
  },

  Mutation: {
    addExpense: async (
      _: unknown,
      { groupId, title, amount, participants }: { groupId: string; title: string; amount: number; participants: ParticipantInput[] },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await checkPermission(prisma, groupId, user.id, "ADD_EXPENSE");

      const totalPaid = participants.reduce((sum, p) => sum + p.paid, 0);
      if (Math.abs(totalPaid - amount) > 0.01)
        throw new GraphQLError(`Paid amounts (${totalPaid}) must equal total (${amount})`);

      const hasCustomOwed = participants.some((p) => p.owed !== undefined);
      let splits: { userId: string; paid: number; owed: number }[];

      if (hasCustomOwed) {
        const totalOwed = participants.reduce((sum, p) => sum + (p.owed ?? 0), 0);
        if (Math.abs(totalOwed - amount) > 0.01)
          throw new GraphQLError(`Custom owed amounts (${totalOwed}) must equal total (${amount})`);
        splits = participants.map((p) => ({ userId: p.userId, paid: p.paid, owed: p.owed! }));
      } else {
        const evenOwed = amount / participants.length;
        splits = participants.map((p) => ({ userId: p.userId, paid: p.paid, owed: evenOwed }));
      }

      const expense = await prisma.expense.create({
        data: {
          groupId, title, amount,
          splits: { create: splits },
        },
      });
      pubsub.publish(SUBSCRIPTION_EVENTS.EXPENSE_ADDED, { expenseAdded: expense, groupId });
      await logActivity(prisma, groupId, user.id, "EXPENSE_ADDED", `Added expense: "${title}" (RS ${amount})`);
      return expense;
    },

    settleExpense: async (_: unknown, { id }: { id: string }, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const expense = await prisma.expense.findUnique({ where: { id } });
      if (!expense) throw new GraphQLError("Expense not found");
      await checkPermission(prisma, expense.groupId, user.id, "SETTLE_EXPENSE");
      const updated = await prisma.expense.update({
        where: { id },
        data: { status: "SETTLED", splits: { updateMany: { where: { expenseId: id }, data: { settled: true } } } },
      });
      pubsub.publish(SUBSCRIPTION_EVENTS.EXPENSE_UPDATED, { expenseUpdated: updated, groupId: updated.groupId });
      await logActivity(prisma, updated.groupId, user.id, "EXPENSE_SETTLED", `Settled expense: "${updated.title}"`);
      return updated;
    },

    deleteExpense: async (_: unknown, { id }: { id: string }, { prisma, currentUser }: GraphQLContext) => {
      requireAuth(currentUser);
      await prisma.expense.delete({ where: { id } });
      return true;
    },

    recordPayment: async (
      _: unknown,
      { groupId, toId, amount, note }: { groupId: string; toId: string; amount: number; note?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });
      if (!member) throw new GraphQLError("Not a member of this group");
      const payment = await prisma.payment.create({ data: { groupId, fromId: user.id, toId, amount, note } });
      await logActivity(prisma, groupId, user.id, "PAYMENT_RECORDED", `Recorded payment of RS ${amount}`);
      return payment;
    },
  },

  Subscription: {
    expenseAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.EXPENSE_ADDED),
        (payload: { groupId: string }, variables: { groupId: string }) =>
          payload.groupId === variables.groupId
      ),
    },
    expenseUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.EXPENSE_UPDATED),
        (payload: { groupId: string }, variables: { groupId: string }) =>
          payload.groupId === variables.groupId
      ),
    },
  },

  Expense: {
    splits: (parent: { id: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.expenseSplit.findMany({ where: { expenseId: parent.id } }),
    group: (parent: { groupId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.group.findUnique({ where: { id: parent.groupId } }),
  },

  ExpenseSplit: {
    user: (parent: { userId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
  },

  Balance: {
    fromUser: (parent: { fromUserId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.fromUserId } }),
    toUser: (parent: { toUserId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.toUserId } }),
  },

  Payment: {
    from: (parent: { fromId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.fromId } }),
    to: (parent: { toId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.toId } }),
  },
};
