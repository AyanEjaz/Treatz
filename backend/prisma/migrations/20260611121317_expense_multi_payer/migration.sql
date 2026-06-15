/*
  Warnings:

  - You are about to drop the column `paidById` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `ExpenseSplit` table. All the data in the column will be lost.
  - Added the required column `owed` to the `ExpenseSplit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_paidById_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "paidById";

-- AlterTable
ALTER TABLE "ExpenseSplit" DROP COLUMN "amount",
ADD COLUMN     "owed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paid" DOUBLE PRECISION NOT NULL DEFAULT 0;
