/*
  Warnings:

  - A unique constraint covering the columns `[userId,sender,message]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Notification_sender_message_key";

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_sender_message_key" ON "Notification"("userId", "sender", "message");
