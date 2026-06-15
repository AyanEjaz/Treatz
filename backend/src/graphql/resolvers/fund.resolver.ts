import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { GraphQLContext } from "../../types/context.types";
import { pubsub, SUBSCRIPTION_EVENTS } from "../../utils/pubsub.utils";
import { logActivity } from "../../utils/activity.utils";

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

export const fundResolvers = {
  Query: {
    groupFund: async (_: unknown, { groupId }: { groupId: string }, { prisma, currentUser }: GraphQLContext) => {
      requireAuth(currentUser);
      const contributions = await prisma.fundContribution.findMany({
        where: { groupId }, orderBy: { createdAt: "desc" },
      });
      const total = contributions.reduce((sum, c) => sum + c.amount, 0);
      return { total, contributions };
    },
  },

  Mutation: {
    contributeToFund: async (
      _: unknown,
      { groupId, amount, note }: { groupId: string; amount: number; note?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await checkPermission(prisma, groupId, user.id, "CONTRIBUTE_FUND");
      const contribution = await prisma.fundContribution.create({
        data: { groupId, userId: user.id, amount, note },
      });
      pubsub.publish(SUBSCRIPTION_EVENTS.FUND_CONTRIBUTED, { fundContributed: contribution, groupId });
      await logActivity(prisma, groupId, user.id, "FUND_CONTRIBUTED", `Contributed RS ${amount} to fund`);
      return contribution;
    },
  },

  Subscription: {
    fundContributed: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.FUND_CONTRIBUTED),
        (payload: { groupId: string }, variables: { groupId: string }) =>
          payload.groupId === variables.groupId
      ),
    },
  },

  FundContribution: {
    user: (parent: { userId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    group: (parent: { groupId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.group.findUnique({ where: { id: parent.groupId } }),
  },
};
