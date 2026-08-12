-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Mc',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentNodeId" TEXT,
    "flags" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatState" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "currentNodeId" TEXT,
    "pendingChoices" JSONB,
    "unread" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinigameProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MinigameProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_deviceId_key" ON "Player"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_playerId_chapterId_key" ON "ChapterProgress"("playerId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatState_playerId_contactId_key" ON "ChatState"("playerId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "MinigameProgress_playerId_gameId_key" ON "MinigameProgress"("playerId", "gameId");

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatState" ADD CONSTRAINT "ChatState_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinigameProgress" ADD CONSTRAINT "MinigameProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
