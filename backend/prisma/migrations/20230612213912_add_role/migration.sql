/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `ChatUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatUser" DROP COLUMN "isAdmin",
ADD COLUMN     "roleId" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "ChatUser" ADD CONSTRAINT "ChatUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
