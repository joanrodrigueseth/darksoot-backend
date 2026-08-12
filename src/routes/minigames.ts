import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware, getAuth } from '../auth';
import { playFromNode } from '../story/engine';
import type { RenderedMessage } from '../story/types';

export const minigamesRouter = Router();
minigamesRouter.use(authMiddleware);

const completeSchema = z.object({
  score: z.number().int().min(0).max(1_000_000),
});

minigamesRouter.post('/pendrive/complete', async (req, res) => {
  const { playerId } = getAuth(req);
  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'score required' });
    return;
  }

  const chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const flags = (chapter?.flags as Record<string, boolean>) ?? {};

  if (!flags.unlock_pendrive_match3) {
    res.status(400).json({ error: 'Minigame not unlocked' });
    return;
  }

  await prisma.minigameProgress.upsert({
    where: { playerId_gameId: { playerId, gameId: 'pendrive_match3' } },
    create: {
      playerId,
      gameId: 'pendrive_match3',
      score: parsed.data.score,
      completedAt: new Date(),
    },
    update: {
      score: parsed.data.score,
      completedAt: new Date(),
    },
  });

  if (flags.pendrive_decrypted) {
    const chat = await prisma.chatState.findUnique({
      where: { playerId_contactId: { playerId, contactId: 'lowe' } },
    });
    res.json({
      ok: true,
      alreadyCompleted: true,
      messages: chat?.messages ?? [],
      pendingChoices: chat?.pendingChoices ?? null,
      events: [{ type: 'chapter_complete', chapterId: '1' }],
    });
    return;
  }

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const played = playFromNode('lowe_after_decrypt', player.displayName);

  const chat = await prisma.chatState.findUniqueOrThrow({
    where: { playerId_contactId: { playerId, contactId: 'lowe' } },
  });
  const existing = (chat.messages as RenderedMessage[]) ?? [];
  const merged = [...existing, ...played.newMessages];

  const nextFlags = {
    ...flags,
    pendrive_decrypted: true,
  };

  const unreadBump = played.newMessages.length;

  await prisma.$transaction([
    prisma.chatState.update({
      where: { id: chat.id },
      data: {
        messages: merged,
        currentNodeId: played.currentNodeId,
        pendingChoices: played.pendingChoices,
        unread: { increment: unreadBump },
      },
    }),
    prisma.chapterProgress.update({
      where: { playerId_chapterId: { playerId, chapterId: '1' } },
      data: {
        currentNodeId: played.currentNodeId,
        flags: nextFlags,
      },
    }),
  ]);

  res.json({
    ok: true,
    newMessages: played.newMessages,
    messages: merged,
    currentNodeId: played.currentNodeId,
    pendingChoices: played.pendingChoices,
    events: played.events,
    flags: nextFlags,
  });
});
