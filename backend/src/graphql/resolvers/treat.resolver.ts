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

export const treatResolvers = {
  Query: {
    groupTreats: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      requireAuth(currentUser);
      return prisma.treat.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } });
    },
  },

  Mutation: {
    addTreat: async (
      _: unknown,
      { groupId, description, reason, owerId }: { groupId: string; description: string; reason?: string; owerId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await checkPermission(prisma, groupId, user.id, "ADD_TREAT");
      const treat = await prisma.treat.create({
        data: { groupId, description, reason, owerId, addedById: user.id },
      });
      pubsub.publish(SUBSCRIPTION_EVENTS.TREAT_ADDED, { treatAdded: treat, groupId });
      await logActivity(prisma, groupId, user.id, "TREAT_ADDED", `Added a treat: "${description}"`);
      return treat;
    },

    completeTreat: async (
      _: unknown,
      { id }: { id: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const treat = await prisma.treat.findUnique({ where: { id } });
      if (!treat) throw new GraphQLError("Treat not found");
      await checkPermission(prisma, treat.groupId, user.id, "COMPLETE_TREAT");
      const updated = await prisma.treat.update({ where: { id }, data: { status: "COMPLETED" } });
      pubsub.publish(SUBSCRIPTION_EVENTS.TREAT_UPDATED, { treatUpdated: updated, groupId: updated.groupId });
      await logActivity(prisma, updated.groupId, user.id, "TREAT_COMPLETED", `Completed a treat: "${updated.description}"`);
      return updated;
    },

    deleteTreat: async (
      _: unknown,
      { id }: { id: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const treat = await prisma.treat.findUnique({ where: { id } });
      if (!treat) throw new GraphQLError("Treat not found");
      await checkPermission(prisma, treat.groupId, user.id, "DELETE_TREAT");
      await prisma.treat.delete({ where: { id } });
      return true;
    },
  },

  Subscription: {
    treatAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.TREAT_ADDED),
        (payload: { groupId: string }, variables: { groupId: string }) =>
          payload.groupId === variables.groupId
      ),
    },
    treatUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_EVENTS.TREAT_UPDATED),
        (payload: { groupId: string }, variables: { groupId: string }) =>
          payload.groupId === variables.groupId
      ),
    },
  },

  Treat: {
    ower: (parent: { owerId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.owerId } }),
    addedBy: (parent: { addedById: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.addedById } }),
    group: (parent: { groupId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.group.findUnique({ where: { id: parent.groupId } }),
  },
};
