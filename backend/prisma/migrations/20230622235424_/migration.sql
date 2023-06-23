/*
  Warnings:

  - You are about to drop the column `sender` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,senderID,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `senderID` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Notification_userId_sender_type_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "sender",
ADD COLUMN     "senderID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_senderID_type_key" ON "Notification"("userId", "senderID", "type");
