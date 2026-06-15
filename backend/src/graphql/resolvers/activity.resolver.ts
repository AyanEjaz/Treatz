import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/context.types";

function requireAuth(currentUser: GraphQLContext["currentUser"]) {
  if (!currentUser)
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return currentUser;
}

export const activityResolvers = {
  Query: {
    groupActivity: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      requireAuth(currentUser);
      return prisma.activityLog.findMany({
        where: { groupId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },

    myNotifications: async (
      _: unknown,
      __: unknown,
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    },

    unreadNotificationCount: async (
      _: unknown,
      __: unknown,
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      return prisma.notification.count({ where: { userId: user.id, read: false } });
    },

    groupAnalytics: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      requireAuth(currentUser);

      const [splits, expenses, treats, fund] = await Promise.all([
        prisma.expenseSplit.findMany({
          where: { expense: { groupId } },
          include: { user: true },
        }),
        prisma.expense.findMany({ where: { groupId } }),
        prisma.treat.findMany({ where: { groupId } }),
        prisma.fundContribution.findMany({ where: { groupId } }),
      ]);

      // Member spending aggregation
      const memberMap: Record<string, { user: typeof splits[0]["user"]; totalOwed: number; totalPaid: number }> = {};
      for (const split of splits) {
        if (!memberMap[split.userId]) {
          memberMap[split.userId] = { user: split.user, totalOwed: 0, totalPaid: 0 };
        }
        memberMap[split.userId].totalOwed += split.owed;
        memberMap[split.userId].totalPaid += split.paid;
      }

      // Monthly spending (last 6 months)
      const monthlyMap: Record<string, number> = {};
      for (const exp of expenses) {
        const month = new Date(exp.createdAt).toISOString().slice(0, 7);
        monthlyMap[month] = (monthlyMap[month] ?? 0) + exp.amount;
      }

      return {
        memberSpending: Object.values(memberMap),
        monthlySpending: Object.entries(monthlyMap)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6),
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalTreats: treats.length,
        totalFund: fund.reduce((sum, f) => sum + f.amount, 0),
      };
    },
  },

  Mutation: {
    markNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const notif = await prisma.notification.findUnique({ where: { id } });
      if (!notif || notif.userId !== user.id) throw new GraphQLError("Notification not found");
      return prisma.notification.update({ where: { id }, data: { read: true } });
    },

    markAllNotificationsRead: async (
      _: unknown,
      __: unknown,
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
      return true;
    },
  },

  ActivityLog: {
    user: (parent: { userId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    group: (parent: { groupId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.group.findUnique({ where: { id: parent.groupId } }),
  },

  Notification: {
    group: (parent: { groupId?: string | null }, _: unknown, { prisma }: GraphQLContext) =>
      parent.groupId ? prisma.group.findUnique({ where: { id: parent.groupId } }) : null,
  },
};
