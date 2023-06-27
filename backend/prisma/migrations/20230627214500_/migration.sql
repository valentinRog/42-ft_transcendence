-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "objectsColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#ffffff';
