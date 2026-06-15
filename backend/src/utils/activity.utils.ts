import { PrismaClient } from "@prisma/client";

export async function logActivity(
  prisma: PrismaClient,
  groupId: string,
  actorId: string,
  type: string,
  message: string,
  metadata?: string
) {
  await prisma.activityLog.create({
    data: { groupId, userId: actorId, type, message, metadata },
  });

  const members = await prisma.groupMember.findMany({
    where: { groupId, userId: { not: actorId } },
    select: { userId: true },
  });

  if (members.length > 0) {
    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId: m.userId,
        groupId,
        type,
        message,
      })),
    });
  }
}
