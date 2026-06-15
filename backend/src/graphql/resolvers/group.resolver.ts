import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/context.types";
import { generateInviteCode } from "../../utils/invite-code.utils";

function requireAuth(currentUser: GraphQLContext["currentUser"]) {
  if (!currentUser)
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return currentUser;
}

async function requireAdmin(prisma: GraphQLContext["prisma"], groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!member || member.role !== "ADMIN")
    throw new GraphQLError("Only admins can perform this action");
  return member;
}

export const groupResolvers = {
  Query: {
    myGroups: async (_: unknown, __: unknown, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const memberships = await prisma.groupMember.findMany({
        where: { userId: user.id },
        include: { group: true },
      });
      return memberships.map((m) => m.group);
    },

    group: async (_: unknown, { id }: { id: string }, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId: id } },
      });
      if (!member) throw new GraphQLError("Access denied");
      return prisma.group.findUnique({ where: { id } });
    },

    myPermissions: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });
      if (!member) return [];
      if (member.role === "ADMIN")
        return ["ADD_TREAT", "COMPLETE_TREAT", "DELETE_TREAT", "ADD_EXPENSE", "SETTLE_EXPENSE", "CONTRIBUTE_FUND"];
      return member.permissions;
    },
  },

  Mutation: {
    createGroup: async (
      _: unknown,
      { name, description }: { name: string; description?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      let inviteCode = generateInviteCode();
      while (await prisma.group.findUnique({ where: { inviteCode } })) {
        inviteCode = generateInviteCode();
      }
      return prisma.group.create({
        data: {
          name, description, inviteCode,
          members: { create: { userId: user.id, role: "ADMIN" } },
        },
      });
    },

    joinGroup: async (
      _: unknown,
      { inviteCode }: { inviteCode: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const group = await prisma.group.findUnique({ where: { inviteCode } });
      if (!group) throw new GraphQLError("Invalid invite code");
      const existing = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId: group.id } },
      });
      if (existing) throw new GraphQLError("Already a member");
      await prisma.groupMember.create({ data: { userId: user.id, groupId: group.id } });
      return group;
    },

    leaveGroup: async (
      _: unknown,
      { groupId }: { groupId: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await prisma.groupMember.delete({
        where: { userId_groupId: { userId: user.id, groupId } },
      });
      return true;
    },

    grantPermission: async (
      _: unknown,
      { groupId, userId, permission }: { groupId: string; userId: string; permission: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await requireAdmin(prisma, groupId, user.id);
      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });
      if (!member) throw new GraphQLError("Member not found");
      if (member.permissions.includes(permission)) return member;
      return prisma.groupMember.update({
        where: { userId_groupId: { userId, groupId } },
        data: { permissions: { push: permission } },
      });
    },

    revokePermission: async (
      _: unknown,
      { groupId, userId, permission }: { groupId: string; userId: string; permission: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      await requireAdmin(prisma, groupId, user.id);
      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });
      if (!member) throw new GraphQLError("Member not found");
      return prisma.groupMember.update({
        where: { userId_groupId: { userId, groupId } },
        data: { permissions: member.permissions.filter((p) => p !== permission) },
      });
    },
  },

  Group: {
    members: (parent: { id: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.groupMember.findMany({ where: { groupId: parent.id }, include: { user: true } }),
    treatCount: (parent: { id: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.treat.count({ where: { groupId: parent.id } }),
    expenseTotal: async (parent: { id: string }, _: unknown, { prisma }: GraphQLContext) => {
      const r = await prisma.expense.aggregate({ where: { groupId: parent.id }, _sum: { amount: true } });
      return r._sum.amount ?? 0;
    },
    fundTotal: async (parent: { id: string }, _: unknown, { prisma }: GraphQLContext) => {
      const r = await prisma.fundContribution.aggregate({ where: { groupId: parent.id }, _sum: { amount: true } });
      return r._sum.amount ?? 0;
    },
  },

  GroupMember: {
    user: (parent: { userId: string }, _: unknown, { prisma }: GraphQLContext) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
  },
};
