/*
  Warnings:

  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `notif_count` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,sender,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Notification_userId_sender_message_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "message",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "notif_count";

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_sender_type_key" ON "Notification"("userId", "sender", "type");
