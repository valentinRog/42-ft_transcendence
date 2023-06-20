/*
  Warnings:

  - You are about to drop the column `loserId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `Match` table. All the data in the column will be lost.
  - Added the required column `loserName` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerName` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_loserId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_winnerId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "loserId",
DROP COLUMN "winnerId",
ADD COLUMN     "loserName" TEXT NOT NULL,
ADD COLUMN     "winnerName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerName_fkey" FOREIGN KEY ("winnerName") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserName_fkey" FOREIGN KEY ("loserName") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
