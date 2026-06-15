-- CreateEnum
CREATE TYPE "PersonalNoteType" AS ENUM ('GAVE', 'TOOK');

-- CreateEnum
CREATE TYPE "PersonalNoteStatus" AS ENUM ('PENDING', 'PARTIAL', 'SETTLED');

-- CreateTable
CREATE TABLE "PersonalNote" (
    "id" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "type" "PersonalNoteType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "PersonalNoteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PersonalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRepayment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "PersonalRepayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PersonalNote" ADD CONSTRAINT "PersonalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRepayment" ADD CONSTRAINT "PersonalRepayment_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "PersonalNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
