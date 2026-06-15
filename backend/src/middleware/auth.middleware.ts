import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../utils/jwt.utils";
import { GraphQLContext } from "../types/context.types";

interface CreateContextOptions {
  token?: string;
  prisma: PrismaClient;
}

export async function createContext({ token, prisma }: CreateContextOptions): Promise<GraphQLContext> {
  if (!token) return { prisma, currentUser: null };

  const payload = verifyToken(token);
  if (!payload) return { prisma, currentUser: null };

  const currentUser = await prisma.user.findUnique({ where: { id: payload.userId } });
  return { prisma, currentUser };
}
