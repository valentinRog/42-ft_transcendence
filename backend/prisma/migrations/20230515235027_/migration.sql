-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hash" TEXT,
    "logFrom42" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'online',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorAuthSecret" TEXT,
    "friends" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "statId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "winnerId" INTEGER NOT NULL,
    "loserId" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" SERIAL NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "ladder" TEXT NOT NULL DEFAULT 'bronze',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_statId_key" ON "User"("statId");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_userId_key" ON "Stat"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
