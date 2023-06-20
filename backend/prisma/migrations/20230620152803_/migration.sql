/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[settingsId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `settingsId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "settingsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "up" TEXT NOT NULL DEFAULT 'ArrowUp',
    "down" TEXT NOT NULL DEFAULT 'ArrowDown',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_settingsId_key" ON "User"("settingsId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
