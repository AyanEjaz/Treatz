import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/context.types";

function requireAuth(currentUser: GraphQLContext["currentUser"]) {
  if (!currentUser)
    throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return currentUser;
}

function computeStatus(amount: number, totalRepaid: number): string {
  if (totalRepaid <= 0) return "PENDING";
  if (totalRepaid >= amount - 0.01) return "SETTLED";
  return "PARTIAL";
}

function enrichNote(note: { amount: number; repayments: { amount: number }[] } & Record<string, unknown>) {
  const totalRepaid = note.repayments.reduce((s: number, r: { amount: number }) => s + r.amount, 0);
  return {
    ...note,
    totalRepaid,
    remaining: Math.max(0, note.amount - totalRepaid),
    status: computeStatus(note.amount, totalRepaid),
  };
}

export const personalResolvers = {
  Query: {
    myPersonalNotes: async (_: unknown, __: unknown, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const notes = await prisma.personalNote.findMany({
        where: { userId: user.id },
        include: { repayments: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      });
      return notes.map(enrichNote);
    },

    myPersonalSummary: async (_: unknown, __: unknown, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const notes = await prisma.personalNote.findMany({
        where: { userId: user.id },
        include: { repayments: true },
      });

      let totalToReceive = 0;
      let totalToGive = 0;
      let pendingCount = 0;

      for (const note of notes) {
        const totalRepaid = note.repayments.reduce((s, r) => s + r.amount, 0);
        const remaining = Math.max(0, note.amount - totalRepaid);
        if (remaining > 0.01) {
          pendingCount++;
          if (note.type === "GAVE") totalToReceive += remaining;
          else totalToGive += remaining;
        }
      }

      return { totalToReceive, totalToGive, netBalance: totalToReceive - totalToGive, pendingCount };
    },

    personalNotesByPerson: async (_: unknown, __: unknown, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const notes = await prisma.personalNote.findMany({
        where: { userId: user.id },
        include: { repayments: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      });

      const byPerson = new Map<string, typeof notes>();
      for (const note of notes) {
        const key = note.personName.trim().toLowerCase();
        if (!byPerson.has(key)) byPerson.set(key, []);
        byPerson.get(key)!.push(note);
      }

      return Array.from(byPerson.entries()).map(([, personNotes]) => {
        let totalToReceive = 0;
        let totalToGive = 0;
        const enriched = personNotes.map(enrichNote);
        for (const n of enriched) {
          if (n.type === "GAVE") totalToReceive += (n as { remaining: number }).remaining;
          else totalToGive += (n as { remaining: number }).remaining;
        }
        return {
          personName: personNotes[0].personName,
          totalToReceive,
          totalToGive,
          net: totalToReceive - totalToGive,
          notes: enriched,
        };
      });
    },
  },

  Mutation: {
    addPersonalNote: async (
      _: unknown,
      { personName, type, amount, description }: { personName: string; type: string; amount: number; description?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const note = await prisma.personalNote.create({
        data: { userId: user.id, personName: personName.trim(), type: type as "GAVE" | "TOOK", amount, description },
        include: { repayments: true },
      });
      return enrichNote(note);
    },

    editPersonalNote: async (
      _: unknown,
      { id, personName, amount, description }: { id: string; personName?: string; amount?: number; description?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const existing = await prisma.personalNote.findUnique({ where: { id } });
      if (!existing || existing.userId !== user.id)
        throw new GraphQLError("Note not found");

      const note = await prisma.personalNote.update({
        where: { id },
        data: {
          ...(personName !== undefined && { personName: personName.trim() }),
          ...(amount !== undefined && { amount }),
          ...(description !== undefined && { description }),
        },
        include: { repayments: { orderBy: { createdAt: "desc" } } },
      });
      return enrichNote(note);
    },

    deletePersonalNote: async (_: unknown, { id }: { id: string }, { prisma, currentUser }: GraphQLContext) => {
      const user = requireAuth(currentUser);
      const existing = await prisma.personalNote.findUnique({ where: { id } });
      if (!existing || existing.userId !== user.id)
        throw new GraphQLError("Note not found");
      await prisma.personalNote.delete({ where: { id } });
      return true;
    },

    addPersonalRepayment: async (
      _: unknown,
      { noteId, amount, note }: { noteId: string; amount: number; note?: string },
      { prisma, currentUser }: GraphQLContext
    ) => {
      const user = requireAuth(currentUser);
      const existing = await prisma.personalNote.findUnique({
        where: { id: noteId },
        include: { repayments: true },
      });
      if (!existing || existing.userId !== user.id)
        throw new GraphQLError("Note not found");

      const totalRepaid = existing.repayments.reduce((s, r) => s + r.amount, 0);
      const remaining = existing.amount - totalRepaid;
      if (amount > remaining + 0.01)
        throw new GraphQLError(`Cannot repay more than remaining: RS ${remaining}`);

      await prisma.personalRepayment.create({ data: { noteId, amount, note } });
      const updated = await prisma.personalNote.findUnique({
        where: { id: noteId },
        include: { repayments: { orderBy: { createdAt: "desc" } } },
      });
      return enrichNote(updated!);
    },
  },
};
