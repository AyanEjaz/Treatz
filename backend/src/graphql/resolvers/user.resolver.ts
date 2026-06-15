import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/context.types";
import { signToken } from "../../utils/jwt.utils";
import { hashPassword, comparePassword } from "../../utils/password.utils";
import { verifyGoogleToken } from "../../utils/google-auth.utils";

export const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, { currentUser }: GraphQLContext) => {
      return currentUser;
    },
    checkUsername: async (
      _: unknown,
      { username }: { username: string },
      { prisma }: GraphQLContext
    ) => {
      const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
      return !existing;
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { password, name, username }: { password: string; name: string; username: string },
      { prisma }: GraphQLContext
    ) => {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (cleanUsername.length < 3) throw new GraphQLError("Username must be at least 3 characters");

      const existingUsername = await prisma.user.findUnique({ where: { username: cleanUsername } });
      if (existingUsername) throw new GraphQLError("Username already taken");

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, username: cleanUsername, password: hashed },
      });

      return { token: signToken({ userId: user.id }), user };
    },

    login: async (
      _: unknown,
      { emailOrUsername, password }: { emailOrUsername: string; password: string },
      { prisma }: GraphQLContext
    ) => {
      const isEmail = emailOrUsername.includes("@");
      const user = isEmail
        ? await prisma.user.findUnique({ where: { email: emailOrUsername } })
        : await prisma.user.findUnique({ where: { username: emailOrUsername.toLowerCase() } });

      if (!user || !user.password) throw new GraphQLError("Invalid credentials");

      const valid = await comparePassword(password, user.password);
      if (!valid) throw new GraphQLError("Invalid credentials");

      return { token: signToken({ userId: user.id }), user };
    },

    googleAuth: async (
      _: unknown,
      { idToken }: { idToken: string },
      { prisma }: GraphQLContext
    ) => {
      const payload = await verifyGoogleToken(idToken);

      let user = await prisma.user.findFirst({
        where: { OR: [{ googleId: payload.googleId }, { email: payload.email }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            avatar: payload.avatar,
            googleId: payload.googleId,
          },
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.googleId, avatar: payload.avatar ?? user.avatar },
        });
      }

      return { token: signToken({ userId: user.id }), user };
    },

    updateProfile: async (
      _: unknown,
      { name, avatar }: { name?: string; avatar?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      if (!currentUser) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });

      return prisma.user.update({
        where: { id: currentUser.id },
        data: { ...(name && { name }), ...(avatar && { avatar }) },
      });
    },
  },
};
