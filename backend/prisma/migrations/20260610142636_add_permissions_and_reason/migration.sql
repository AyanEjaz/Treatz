-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Treat" ADD COLUMN     "reason" TEXT;
