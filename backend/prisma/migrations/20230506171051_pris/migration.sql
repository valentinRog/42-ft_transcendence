-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "logFrom42" BOOLEAN NOT NULL DEFAULT false;
