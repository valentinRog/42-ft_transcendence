/*
  Warnings:

  - You are about to drop the column `userId` on the `Stat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Stat_userId_key";

-- AlterTable
ALTER TABLE "Stat" DROP COLUMN "userId";
