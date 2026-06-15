import { PrismaClient, User } from "@prisma/client";

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: User | null;
}

export interface JwtPayload {
  userId: string;
  email?: string;
}
